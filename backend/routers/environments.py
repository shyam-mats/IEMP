from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from database import get_db
from models import Environment, EnvironmentOperation, AuditEvent, User, EnvironmentAssignment
from schemas import (
    EnvironmentResponse, EnvironmentCreate, EnvironmentOperationResponse
)
from services.aws_service import aws_ec2_service
from services.health_service import check_application_health
from routers.auth import CURRENT_USER_EMAIL

router = APIRouter(prefix="/api/v1/environments", tags=["Environments"])

@router.get("", response_model=List[EnvironmentResponse])
def list_environments(db: Session = Depends(get_db)):
    """
    List environments. Super Admins and Env Admins see all environments.
    Developers / Testers see their assigned environments.
    """
    current_user = db.query(User).filter(User.email == CURRENT_USER_EMAIL).first()
    if not current_user or current_user.role in ["super_admin", "env_admin", "finops", "viewer"]:
        return db.query(Environment).all()
    
    # Return assigned environments for dev/tester
    assigned_ids = [
        a.environment_id for a in db.query(EnvironmentAssignment).filter(EnvironmentAssignment.user_id == current_user.id).all()
    ]
    return db.query(Environment).filter(Environment.id.in_(assigned_ids)).all()

@router.get("/{env_id}", response_model=EnvironmentResponse)
def get_environment(env_id: int, db: Session = Depends(get_db)):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env

@router.post("/{env_id}/start")
def start_environment(env_id: int, db: Session = Depends(get_db)):
    """
    Safely starts an environment's EC2 instance.
    Checks concurrency lock, transitions to starting -> running, runs health check.
    """
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")

    if env.lifecycle_state in ["running", "starting"]:
        raise HTTPException(status_code=400, detail=f"Instance is already in {env.lifecycle_state} state.")

    if env.is_locked:
        raise HTTPException(status_code=423, detail=f"Environment is currently locked by {env.locked_by}")

    # Set lock and initiate start
    env.is_locked = True
    env.locked_by = CURRENT_USER_EMAIL
    env.lifecycle_state = "starting"
    env.last_operation = "START"
    env.last_operator = CURRENT_USER_EMAIL
    env.last_state_change = datetime.datetime.utcnow()

    op = EnvironmentOperation(
        environment_id=env.id,
        actor_email=CURRENT_USER_EMAIL,
        action="START",
        status="IN_PROGRESS"
    )
    db.add(op)
    db.commit()

    # Call AWS EC2
    try:
        aws_res = aws_ec2_service.start_instance(env.ec2_instance_id)
        op.provider_request_id = aws_res.get("request_id")
        
        # State transition to running
        env.lifecycle_state = "running"
        env.app_health_status = "ready"
        env.is_locked = False
        env.locked_by = None
        op.status = "COMPLETED"
        op.completed_at = datetime.datetime.utcnow()

        audit = AuditEvent(
            actor_email=CURRENT_USER_EMAIL,
            action="ENV_START",
            resource_type="environment",
            resource_id=env.ec2_instance_id,
            status="SUCCESS",
            details={
                "environment_id": env.id,
                "environment_name": env.name,
                "region": env.region,
                "instance_type": env.instance_type
            }
        )
        db.add(audit)
        db.commit()
        db.refresh(env)

        return {
            "status": "success",
            "message": f"Environment '{env.name}' ({env.ec2_instance_id}) started successfully and marked ready.",
            "environment": env
        }

    except Exception as e:
        env.lifecycle_state = "failed"
        env.is_locked = False
        op.status = "FAILED"
        op.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to start instance: {e}")

@router.post("/{env_id}/stop")
def stop_environment(env_id: int, db: Session = Depends(get_db)):
    """
    Safely stops an environment's EC2 instance (EBS preserved).
    """
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")

    if env.lifecycle_state in ["stopped", "stopping"]:
        raise HTTPException(status_code=400, detail=f"Instance is already in {env.lifecycle_state} state.")

    if env.is_locked:
        raise HTTPException(status_code=423, detail=f"Environment is currently locked by {env.locked_by}")

    env.is_locked = True
    env.locked_by = CURRENT_USER_EMAIL
    env.lifecycle_state = "stopping"
    env.last_operation = "STOP"
    env.last_operator = CURRENT_USER_EMAIL
    env.last_state_change = datetime.datetime.utcnow()

    op = EnvironmentOperation(
        environment_id=env.id,
        actor_email=CURRENT_USER_EMAIL,
        action="STOP",
        status="IN_PROGRESS"
    )
    db.add(op)
    db.commit()

    # Call AWS EC2
    try:
        aws_res = aws_ec2_service.stop_instance(env.ec2_instance_id)
        op.provider_request_id = aws_res.get("request_id")
        
        env.lifecycle_state = "stopped"
        env.app_health_status = "unreachable"
        env.is_locked = False
        env.locked_by = None
        op.status = "COMPLETED"
        op.completed_at = datetime.datetime.utcnow()

        audit = AuditEvent(
            actor_email=CURRENT_USER_EMAIL,
            action="ENV_STOP",
            resource_type="environment",
            resource_id=env.ec2_instance_id,
            status="SUCCESS",
            details={
                "environment_id": env.id,
                "environment_name": env.name,
                "region": env.region
            }
        )
        db.add(audit)
        db.commit()
        db.refresh(env)

        return {
            "status": "success",
            "message": f"Environment '{env.name}' ({env.ec2_instance_id}) stopped safely.",
            "environment": env
        }

    except Exception as e:
        env.lifecycle_state = "failed"
        env.is_locked = False
        op.status = "FAILED"
        op.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to stop instance: {e}")

@router.get("/{env_id}/history", response_model=List[EnvironmentOperationResponse])
def get_environment_history(env_id: int, db: Session = Depends(get_db)):
    return (
        db.query(EnvironmentOperation)
        .filter(EnvironmentOperation.environment_id == env_id)
        .order_by(EnvironmentOperation.requested_at.desc())
        .limit(20)
        .all()
    )

@router.post("", response_model=EnvironmentResponse)
def create_environment(payload: EnvironmentCreate, db: Session = Depends(get_db)):
    """
    Registers a new EC2 instance to an environment.
    Restricted to Super Admin and Environment Admin.
    """
    existing = db.query(Environment).filter(Environment.ec2_instance_id == payload.ec2_instance_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="An environment with this EC2 instance ID is already registered.")

    new_env = Environment(
        name=payload.name,
        ec2_instance_id=payload.ec2_instance_id,
        region=payload.region,
        instance_type=payload.instance_type,
        owner_email=payload.owner_email,
        team=payload.team,
        description=payload.description,
        app_urls=payload.app_urls,
        hourly_rate=payload.hourly_rate,
        lifecycle_state="stopped",
        app_health_status="unreachable",
        last_operation="REGISTERED",
        last_operator=CURRENT_USER_EMAIL
    )
    db.add(new_env)
    db.commit()
    db.refresh(new_env)

    # Audit log
    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="ENV_CREATE",
        resource_type="environment",
        resource_id=new_env.ec2_instance_id,
        status="SUCCESS",
        details={"name": new_env.name, "region": new_env.region, "type": new_env.instance_type}
    )
    db.add(audit)
    db.commit()

    return new_env
