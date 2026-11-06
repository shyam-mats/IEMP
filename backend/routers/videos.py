from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from database import get_db
from models import Video, AuditEvent
from schemas import VideoResponse, VideoCreate
from routers.auth import CURRENT_USER_EMAIL

router = APIRouter(prefix="/api/v1/videos", tags=["Video Catalog"])

@router.get("", response_model=List[VideoResponse])
def list_videos(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Video)
    if category and category != "All":
        query = query.filter(Video.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Video.title.ilike(search_filter)) | 
            (Video.description.ilike(search_filter))
        )
    return query.order_by(Video.upload_date.desc()).all()

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.post("", response_model=VideoResponse)
def register_video(payload: VideoCreate, db: Session = Depends(get_db)):
    video = Video(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        tags=payload.tags,
        uploader_name="Shyam Sundar Tyagi",
        upload_date=datetime.datetime.utcnow(),
        duration_seconds=payload.duration_seconds,
        video_url=payload.video_url,
        thumbnail_url=payload.thumbnail_url or "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80",
        view_count=0
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    audit = AuditEvent(
        actor_email=CURRENT_USER_EMAIL,
        action="VIDEO_UPLOAD",
        resource_type="video",
        resource_id=str(video.id),
        status="SUCCESS",
        details={"title": video.title, "category": video.category}
    )
    db.add(audit)
    db.commit()
    return video

@router.post("/{video_id}/view")
def increment_view_count(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video.view_count += 1
    db.commit()
    return {"status": "ok", "view_count": video.view_count}
