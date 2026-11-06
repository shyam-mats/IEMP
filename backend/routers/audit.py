from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
from database import get_db
from models import AuditEvent
from schemas import AuditEventResponse

router = APIRouter(prefix="/api/v1/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditEventResponse])
def get_audit_trail(
    actor: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if actor:
        query = query.filter(AuditEvent.actor_email.ilike(f"%{actor}%"))
    if action and action != "All":
        query = query.filter(AuditEvent.action == action)
    if resource_type and resource_type != "All":
        query = query.filter(AuditEvent.resource_type == resource_type)

    return query.order_by(AuditEvent.timestamp.desc()).limit(limit).all()

@router.get("/export")
def export_audit_log(db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Event ID", "Timestamp (UTC)", "Actor", "Action",
        "Resource Type", "Resource ID", "IP Address", "Status", "Details"
    ])

    for e in events:
        writer.writerow([
            e.id,
            e.timestamp.isoformat(),
            e.actor_email,
            e.action,
            e.resource_type,
            e.resource_id,
            e.ip_address,
            e.status,
            str(e.details)
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_trail_export.csv"}
    )
