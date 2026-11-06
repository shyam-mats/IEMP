from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import ApplicationTile, AuditEvent
from schemas import (
    ApplicationTileResponse, ApplicationTileCreate, ApplicationTileUpdate
)
from services.health_service import check_application_health
from routers.auth import CURRENT_USER_EMAIL

router = APIRouter(prefix="/api/v1/applications", tags=["Applications Launcher"])

@router.get("", response_model=List[ApplicationTileResponse])
def list_application_tiles(db: Session = Depends(get_db)):
    return db.query(ApplicationTile).filter(ApplicationTile.is_active == True).all()

@router.get("/{tile_id}", response_model=ApplicationTileResponse)
def get_application_tile(tile_id: int, db: Session = Depends(get_db)):
    tile = db.query(ApplicationTile).filter(ApplicationTile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")
    return tile

@router.post("", response_model=ApplicationTileResponse)
def create_application_tile(payload: ApplicationTileCreate, db: Session = Depends(get_db)):
    tile = ApplicationTile(
        name=payload.name,
        url=payload.url,
        icon=payload.icon,
        category=payload.category,
        description=payload.description,
        environment_id=payload.environment_id,
        health_check_url=payload.health_check_url,
        access_policy=payload.access_policy,
        is_active=payload.is_active,
        health_status="healthy"
    )
    db.add(tile)
    db.commit()
    db.refresh(tile)

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="TILE_CREATE",
        resource_type="application",
        resource_id=str(tile.id),
        status="SUCCESS",
        details={"name": tile.name, "url": tile.url, "category": tile.category}
    )
    db.add(audit)
    db.commit()
    return tile

@router.put("/{tile_id}", response_model=ApplicationTileResponse)
def update_application_tile(tile_id: int, payload: ApplicationTileUpdate, db: Session = Depends(get_db)):
    tile = db.query(ApplicationTile).filter(ApplicationTile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tile, key, value)

    db.commit()
    db.refresh(tile)
    return tile

@router.delete("/{tile_id}")
def delete_application_tile(tile_id: int, db: Session = Depends(get_db)):
    tile = db.query(ApplicationTile).filter(ApplicationTile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    tile.is_active = False # Soft delete
    db.commit()

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="TILE_DELETE",
        resource_type="application",
        resource_id=str(tile.id),
        status="SUCCESS",
        details={"name": tile.name}
    )
    db.add(audit)
    db.commit()
    return {"message": f"Application tile '{tile.name}' deactivated."}

@router.post("/{tile_id}/launch")
def log_application_launch(tile_id: int, db: Session = Depends(get_db)):
    tile = db.query(ApplicationTile).filter(ApplicationTile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="APP_LAUNCH",
        resource_type="application",
        resource_id=str(tile.id),
        status="SUCCESS",
        details={"name": tile.name, "target_url": tile.url}
    )
    db.add(audit)
    db.commit()
    return {"status": "ok", "url": tile.url}

@router.post("/{tile_id}/check-health")
async def run_health_check(tile_id: int, db: Session = Depends(get_db)):
    tile = db.query(ApplicationTile).filter(ApplicationTile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    res = await check_application_health(tile.health_check_url or tile.url)
    tile.health_status = res.get("status", "unknown")
    db.commit()
    db.refresh(tile)
    return res
