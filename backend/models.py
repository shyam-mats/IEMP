import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    zoho_id = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="developer_tester") # super_admin, env_admin, developer_tester, finops, content_manager, viewer
    status = Column(String(50), default="active") # active, pending_approval, suspended
    department = Column(String(100), default="Engineering")
    avatar = Column(String(255), nullable=True)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assignments = relationship("EnvironmentAssignment", back_populates="user", cascade="all, delete-orphan")

class Environment(Base):
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    ec2_instance_id = Column(String(100), unique=True, index=True, nullable=False)
    region = Column(String(50), default="us-east-1")
    instance_type = Column(String(50), default="t3.xlarge")
    owner_email = Column(String(255), nullable=False)
    team = Column(String(100), default="Platform QA")
    description = Column(Text, nullable=True)
    app_urls = Column(JSON, default=list) # List of related application links
    
    # State flags
    lifecycle_state = Column(String(50), default="stopped") # stopped, pending, starting, running, stopping, failed
    app_health_status = Column(String(50), default="unreachable") # ready, degraded, unreachable, checking
    last_operation = Column(String(50), default="INIT")
    last_operator = Column(String(255), default="System")
    last_state_change = Column(DateTime, default=datetime.datetime.utcnow)
    uptime_hours = Column(Float, default=0.0)
    hourly_rate = Column(Float, default=0.1664) # Indicative cost/hr for t3.xlarge
    
    # Concurrency lock
    is_locked = Column(Boolean, default=False)
    locked_by = Column(String(255), nullable=True)

    assignments = relationship("EnvironmentAssignment", back_populates="environment", cascade="all, delete-orphan")
    operations = relationship("EnvironmentOperation", back_populates="environment", cascade="all, delete-orphan")

class EnvironmentAssignment(Base):
    __tablename__ = "environment_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    environment_id = Column(Integer, ForeignKey("environments.id"))
    permission_level = Column(String(50), default="operator") # admin, operator, viewer

    user = relationship("User", back_populates="assignments")
    environment = relationship("Environment", back_populates="assignments")

class ApplicationTile(Base):
    __tablename__ = "application_tiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    icon = Column(String(100), default="Layers")
    category = Column(String(100), default="Core Services") # Core Services, Simulators, Observability, APIs, QA Tools
    description = Column(Text, nullable=True)
    environment_id = Column(Integer, ForeignKey("environments.id"), nullable=True)
    health_check_url = Column(String(500), nullable=True)
    health_status = Column(String(50), default="healthy") # healthy, warning, down, unknown
    access_policy = Column(String(100), default="all_authenticated")
    is_active = Column(Boolean, default=True)

class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Product Demonstrations")
    tags = Column(JSON, default=list)
    uploader_name = Column(String(255), nullable=False)
    uploader_email = Column(String(255), nullable=False)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    version = Column(String(50), default="v1.0")
    download_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    slide_count = Column(Integer, default=15)
    size_mb = Column(Float, default=4.5)

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Technical Demonstrations")
    tags = Column(JSON, default=list)
    uploader_name = Column(String(255), nullable=False)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    duration_seconds = Column(Integer, default=320)
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)

class EnvironmentOperation(Base):
    __tablename__ = "environment_operations"

    id = Column(Integer, primary_key=True, index=True)
    environment_id = Column(Integer, ForeignKey("environments.id"))
    actor_email = Column(String(255), nullable=False)
    action = Column(String(50), nullable=False) # START, STOP
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="IN_PROGRESS") # IN_PROGRESS, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)
    provider_request_id = Column(String(100), nullable=True)

    environment = relationship("Environment", back_populates="operations")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False) # AUTH_LOGIN, ENV_START, ENV_STOP, APP_LAUNCH, TILE_CREATE, USER_UPDATE
    resource_type = Column(String(100), nullable=False) # environment, application, presentation, user, costing
    resource_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String(50), default="127.0.0.1")
    status = Column(String(50), default="SUCCESS") # SUCCESS, DENIED, FAILED
    details = Column(JSON, default=dict)

class CloudCostRecord(Base):
    __tablename__ = "cloud_cost_records"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False) # AWS, GCP
    service = Column(String(100), nullable=False) # EC2, S3, RDS, Compute Engine, GKE, BigQuery
    region = Column(String(50), nullable=False)
    project_or_account = Column(String(100), nullable=False)
    team = Column(String(100), default="Engineering")
    environment_id = Column(Integer, ForeignKey("environments.id"), nullable=True)
    date = Column(String(10), nullable=False) # YYYY-MM-DD
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    cost_basis = Column(String(50), default="actual") # actual, estimated, amortized
