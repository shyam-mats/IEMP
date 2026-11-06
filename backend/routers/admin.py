from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, EnvironmentAssignment, AuditEvent
from schemas import UserResponse, UserRoleUpdate
from routers.auth import CURRENT_USER_EMAIL

router = APIRouter(prefix="/api/v1/admin", tags=["Administration"])

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()

@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: int, payload: UserRoleUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role
    user.role = payload.role
    if payload.status:
        user.status = payload.status

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="USER_ROLE_CHANGE",
        resource_type="user",
        resource_id=str(user.id),
        status="SUCCESS",
        details={"user_email": user.email, "old_role": old_role, "new_role": payload.role}
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/approve")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "active"
    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="USER_ACCESS_APPROVAL",
        resource_type="user",
        resource_id=str(user.id),
        status="SUCCESS",
        details={"user_email": user.email, "approved_by": CURRENT_USER_EMAIL}
    )
    db.add(audit)
    db.commit()
    return {"message": f"User {user.email} approved for platform access."}
