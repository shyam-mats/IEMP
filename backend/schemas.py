from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import datetime

# --- Auth & User ---
class UserBase(BaseModel):
    email: str
    name: str
    role: str = "developer_tester"
    department: str = "Engineering"
    avatar: Optional[str] = None

class UserCreate(UserBase):
    zoho_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    zoho_id: Optional[str] = None
    status: str
    last_login: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str
    status: Optional[str] = None

# --- Environment ---
class EnvironmentBase(BaseModel):
    name: str
    ec2_instance_id: str
    region: str = "us-east-1"
    instance_type: str = "t3.xlarge"
    owner_email: str
    team: str = "Platform QA"
    description: Optional[str] = None
    app_urls: List[Dict[str, str]] = []
    hourly_rate: float = 0.1664

class EnvironmentCreate(EnvironmentBase):
    pass

class EnvironmentResponse(EnvironmentBase):
    id: int
    lifecycle_state: str
    app_health_status: str
    last_operation: str
    last_operator: str
    last_state_change: Optional[datetime.datetime] = None
    uptime_hours: float
    is_locked: bool
    locked_by: Optional[str] = None

    class Config:
        from_attributes = True

class EnvironmentOperationResponse(BaseModel):
    id: int
    environment_id: int
    action: str
    status: str
    actor_email: str
    requested_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    error_message: Optional[str] = None
    provider_request_id: Optional[str] = None

    class Config:
        from_attributes = True

# --- Application Tile ---
class ApplicationTileBase(BaseModel):
    name: str
    url: str
    icon: str = "Layers"
    category: str = "Core Services"
    description: Optional[str] = None
    environment_id: Optional[int] = None
    health_check_url: Optional[str] = None
    access_policy: str = "all_authenticated"
    is_active: bool = True

class ApplicationTileCreate(ApplicationTileBase):
    pass

class ApplicationTileUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    environment_id: Optional[int] = None
    health_check_url: Optional[str] = None
    access_policy: Optional[str] = None
    is_active: Optional[bool] = None

class ApplicationTileResponse(ApplicationTileBase):
    id: int
    health_status: str

    class Config:
        from_attributes = True

# --- Content: Presentations & Videos ---
class PresentationResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    uploader_name: str
    uploader_email: str
    upload_date: datetime.datetime
    version: str
    download_url: str
    thumbnail_url: Optional[str] = None
    slide_count: int
    size_mb: float

    class Config:
        from_attributes = True

class PresentationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Product Demonstrations"
    tags: List[str] = []
    version: str = "v1.0"
    download_url: str
    thumbnail_url: Optional[str] = None
    slide_count: int = 10
    size_mb: float = 2.5

class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    uploader_name: str
    upload_date: datetime.datetime
    duration_seconds: int
    video_url: str
    thumbnail_url: Optional[str] = None
    view_count: int

    class Config:
        from_attributes = True

class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Technical Demonstrations"
    tags: List[str] = []
    duration_seconds: int = 180
    video_url: str
    thumbnail_url: Optional[str] = None

# --- Audit ---
class AuditEventResponse(BaseModel):
    id: int
    actor_email: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    timestamp: datetime.datetime
    ip_address: str
    status: str
    details: Dict[str, Any] = {}

    class Config:
        from_attributes = True

# --- Cloud Cost Management ---
class CostSummaryResponse(BaseModel):
    aws_cost_mtd: float
    gcp_cost_mtd: float
    total_cost_mtd: float
    previous_month_total: float
    mom_percentage_change: float
    daily_average: float
    estimated_month_end: float
    currency: str = "USD"
    cost_basis: str = "actual_reported"
    data_freshness: str

class CostTrendPoint(BaseModel):
    date: str
    aws_cost: float
    gcp_cost: float
    total_cost: float

class ServiceCostItem(BaseModel):
    provider: str
    service: str
    cost: float
    percentage: float

class EnvironmentCostItem(BaseModel):
    environment_id: int
    environment_name: str
    instance_type: str
    hourly_rate: float
    monthly_run_rate: float
    actual_cost_mtd: float
    team: str
