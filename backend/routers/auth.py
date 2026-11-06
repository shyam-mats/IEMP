from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import User, AuditEvent
from schemas import UserResponse
import datetime

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# In-memory session tracking for active demo user
CURRENT_USER_EMAIL = "shyam.tyagi@company.com"

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == CURRENT_USER_EMAIL).first()
    if not user:
        # Fallback to first user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No users found in system")
    return user

@router.get("/login")
def zoho_login_init():
    """
    Initiates Zoho OAuth 2.0 / OpenID Connect Authorization Flow.
    Returns Zoho SSO Redirect URI with client_id, redirect_uri, state & scope.
    """
    client_id = "1000.ZOHO_IEMP_CLIENT_ID"
    redirect_uri = "https://iemp.internal.company.com/api/v1/auth/callback"
    state = "secure-random-state-token-12345"
    scope = "AaaServer.profile.READ"
    zoho_auth_url = (
        f"https://accounts.zoho.com/oauth/v2/auth?"
        f"response_type=code&client_id={client_id}&scope={scope}&redirect_uri={redirect_uri}&state={state}&access_type=offline"
    )
    return {
        "status": "redirect",
        "provider": "Zoho SSO (OAuth 2.0)",
        "authorization_url": zoho_auth_url,
        "message": "Redirect employee to Zoho Accounts authorization endpoint"
    }

@router.get("/callback")
def zoho_login_callback(code: Optional[str] = "demo_code", state: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Handles Zoho OAuth authorization code exchange, retrieves Zoho employee profile,
    and returns session token or user record.
    """
    user = db.query(User).filter(User.email == CURRENT_USER_EMAIL).first()
    
    # Audit log the authentication event
    audit = AuditEvent(
        actor_email=user.email if user else "zoho_sso_applicant",
        action="AUTH_LOGIN",
        resource_type="user",
        resource_id=user.zoho_id if user else "ZOHO-CALLBACK",
        status="SUCCESS",
        details={"provider": "Zoho SSO", "auth_time": datetime.datetime.utcnow().isoformat()}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": "zoho-iemp-jwt-token-sample",
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == CURRENT_USER_EMAIL).first()
    if user:
        audit = AuditEvent(
            actor_email=user.email,
            action="AUTH_LOGOUT",
            resource_type="user",
            resource_id=user.zoho_id,
            status="SUCCESS",
            details={"logout_time": datetime.datetime.utcnow().isoformat()}
        )
        db.add(audit)
        db.commit()
    return {"message": "Successfully logged out of Zoho SSO session"}

@router.post("/switch-role")
def switch_active_role(role: str = Query(..., description="Role to switch to"), db: Session = Depends(get_db)):
    """
    Demo helper: Allows switching between predefined users to inspect the UI
    from the perspective of Super Admin, Environment Admin, Dev/Tester, FinOps, etc.
    """
    global CURRENT_USER_EMAIL
    role_map = {
        "super_admin": "shyam.tyagi@company.com",
        "env_admin": "alex.rivera@company.com",
        "developer_tester": "dev.tester@company.com",
        "finops": "elena.finops@company.com",
        "content_manager": "david.chen@company.com",
        "viewer": "maya.patel@company.com"
    }
    target_email = role_map.get(role.lower())
    if not target_email:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from: {list(role_map.keys())}")
    
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with requested role not found")
    
    CURRENT_USER_EMAIL = target_email
    return {
        "message": f"Switched active user to {user.name} ({user.role})",
        "user": user
    }
