from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from database import get_db
from models import Presentation, AuditEvent
from schemas import PresentationResponse, PresentationCreate
from routers.auth import CURRENT_USER_EMAIL

router = APIRouter(prefix="/api/v1/presentations", tags=["PPT Catalog"])

@router.get("", response_model=List[PresentationResponse])
def list_presentations(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Presentation)
    if category and category != "All":
        query = query.filter(Presentation.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Presentation.title.ilike(search_filter)) | 
            (Presentation.description.ilike(search_filter))
        )
    return query.order_by(Presentation.upload_date.desc()).all()

@router.get("/{ppt_id}", response_model=PresentationResponse)
def get_presentation(ppt_id: int, db: Session = Depends(get_db)):
    ppt = db.query(Presentation).filter(Presentation.id == ppt_id).first()
    if not ppt:
        raise HTTPException(status_code=404, detail="Presentation not found")
    return ppt

@router.post("", response_model=PresentationResponse)
def upload_presentation(payload: PresentationCreate, db: Session = Depends(get_db)):
    ppt = Presentation(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        tags=payload.tags,
        uploader_name="Shyam Sundar Tyagi",
        uploader_email=CURRENT_USER_EMAIL,
        upload_date=datetime.datetime.utcnow(),
        version=payload.version,
        download_url=payload.download_url,
        thumbnail_url=payload.thumbnail_url or "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80",
        slide_count=payload.slide_count,
        size_mb=payload.size_mb
    )
    db.add(ppt)
    db.commit()
    db.refresh(ppt)

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="CONTENT_UPLOAD",
        resource_type="presentation",
        resource_id=str(ppt.id),
        status="SUCCESS",
        details={"title": ppt.title, "category": ppt.category, "version": ppt.version}
    )
    db.add(audit)
    db.commit()
    return ppt

@router.get("/{ppt_id}/download")
def download_presentation(ppt_id: int, db: Session = Depends(get_db)):
    ppt = db.query(Presentation).filter(Presentation.id == ppt_id).first()
    if not ppt:
        raise HTTPException(status_code=404, detail="Presentation not found")

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="CONTENT_DOWNLOAD",
        resource_type="presentation",
        resource_id=str(ppt.id),
        status="SUCCESS",
        details={"title": ppt.title, "version": ppt.version}
    )
    db.add(audit)
    db.commit()

    return {
        "status": "ready",
        "download_url": ppt.download_url,
        "title": ppt.title,
        "filename": f"{ppt.title.replace(' ', '_').lower()}.pptx"
    }
