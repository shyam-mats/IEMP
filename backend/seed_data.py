import datetime
import random
from database import SessionLocal, Base, engine
from models import (
    User, Environment, EnvironmentAssignment, ApplicationTile,
    Presentation, Video, EnvironmentOperation, AuditEvent, CloudCostRecord
)

def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        db.close()
        return

    print("Seeding initial data for IEMP...")

    # 1. Users
    users = [
        User(
            zoho_id="ZOHO-EMP-001",
            email="shyam.tyagi@company.com",
            name="Shyam Sundar Tyagi",
            role="super_admin",
            status="active",
            department="Cloud Platform & QA",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow()
        ),
        User(
            zoho_id="ZOHO-EMP-002",
            email="alex.rivera@company.com",
            name="Alex Rivera",
            role="env_admin",
            status="active",
            department="DevOps & Infrastructure",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        ),
        User(
            zoho_id="ZOHO-EMP-003",
            email="dev.tester@company.com",
            name="Priya Sharma",
            role="developer_tester",
            status="active",
            department="Core Banking QA",
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        ),
        User(
            zoho_id="ZOHO-EMP-004",
            email="elena.finops@company.com",
            name="Elena Rostova",
            role="finops",
            status="active",
            department="Cloud Economics & FinOps",
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        ),
        User(
            zoho_id="ZOHO-EMP-005",
            email="david.chen@company.com",
            name="David Chen",
            role="content_manager",
            status="active",
            department="Technical Enablement",
            avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        ),
        User(
            zoho_id="ZOHO-EMP-006",
            email="maya.patel@company.com",
            name="Maya Patel",
            role="viewer",
            status="active",
            department="Product Management",
            avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            last_login=datetime.datetime.utcnow() - datetime.timedelta(days=3)
        ),
    ]
    db.add_all(users)
    db.commit()

    # 2. Environments
    envs = [
        Environment(
            name="Payment Gateway Staging",
            ec2_instance_id="i-078a9c12df8b103e4",
            region="us-east-1",
            instance_type="c5.2xlarge",
            owner_email="shyam.tyagi@company.com",
            team="Payments Engineering",
            description="High-throughput payment processing sandbox with simulated VISA/Mastercard/UPI settlement endpoints.",
            app_urls=[
                {"name": "Payment Gateway UI", "url": "https://staging-pay.internal.local"},
                {"name": "Transaction Webhook Mock", "url": "https://webhook-mock.internal.local"}
            ],
            lifecycle_state="running",
            app_health_status="ready",
            last_operation="START",
            last_operator="shyam.tyagi@company.com",
            uptime_hours=14.5,
            hourly_rate=0.34
        ),
        Environment(
            name="Core Banking & Ledger Sandbox",
            ec2_instance_id="i-043b23c445109d98a",
            region="ap-south-1",
            instance_type="m5.2xlarge",
            owner_email="dev.tester@company.com",
            team="Banking QA",
            description="Dedicated double-entry ledger database and core account simulation environment.",
            app_urls=[
                {"name": "Ledger Admin Console", "url": "https://ledger-sandbox.internal.local"},
                {"name": "Account Balancing API", "url": "https://api-ledger.internal.local/swagger"}
            ],
            lifecycle_state="stopped",
            app_health_status="unreachable",
            last_operation="STOP",
            last_operator="dev.tester@company.com",
            uptime_hours=0.0,
            hourly_rate=0.384
        ),
        Environment(
            name="Identity & KYC Verification Testbed",
            ec2_instance_id="i-091a329ef312bc901",
            region="eu-west-1",
            instance_type="t3.xlarge",
            owner_email="alex.rivera@company.com",
            team="Security & Compliance",
            description="OIDC/OAuth 2.0 federation and document verification OCR testing pipeline.",
            app_urls=[
                {"name": "KYC Simulator Web", "url": "https://kyc-test.internal.local"},
                {"name": "OIDC Identity Mock", "url": "https://auth-mock.internal.local/.well-known"}
            ],
            lifecycle_state="running",
            app_health_status="ready",
            last_operation="START",
            last_operator="alex.rivera@company.com",
            uptime_hours=6.2,
            hourly_rate=0.1664
        ),
        Environment(
            name="Fraud Analytics ML Pipeline",
            ec2_instance_id="i-05bf87192ac77e412",
            region="us-west-2",
            instance_type="g4dn.xlarge",
            owner_email="shyam.tyagi@company.com",
            team="Risk & ML Ops",
            description="GPU-accelerated anomaly detection test environment running PyTorch inference models.",
            app_urls=[
                {"name": "Risk Scoring Dashboard", "url": "https://ml-risk.internal.local"},
                {"name": "MLflow Experiment UI", "url": "https://mlflow-track.internal.local"}
            ],
            lifecycle_state="stopped",
            app_health_status="unreachable",
            last_operation="STOP",
            last_operator="elena.finops@company.com",
            uptime_hours=0.0,
            hourly_rate=0.526
        ),
        Environment(
            name="Merchant Portal Demo Lab",
            ec2_instance_id="i-033dae81249b5c219",
            region="us-east-2",
            instance_type="t3.large",
            owner_email="david.chen@company.com",
            team="Merchant Onboarding",
            description="Pre-sales demo environment for testing merchant dashboard checkout workflows.",
            app_urls=[
                {"name": "Merchant Dashboard Demo", "url": "https://demo-merchant.internal.local"}
            ],
            lifecycle_state="running",
            app_health_status="ready",
            last_operation="START",
            last_operator="david.chen@company.com",
            uptime_hours=28.1,
            hourly_rate=0.0832
        )
    ]
    db.add_all(envs)
    db.commit()

    # 3. Environment Assignments
    shyam = db.query(User).filter_by(email="shyam.tyagi@company.com").first()
    priya = db.query(User).filter_by(email="dev.tester@company.com").first()
    alex = db.query(User).filter_by(email="alex.rivera@company.com").first()

    for env in envs:
        db.add(EnvironmentAssignment(user_id=shyam.id, environment_id=env.id, permission_level="admin"))
    
    # Assign specific to priya & alex
    db.add(EnvironmentAssignment(user_id=priya.id, environment_id=envs[1].id, permission_level="operator"))
    db.add(EnvironmentAssignment(user_id=priya.id, environment_id=envs[0].id, permission_level="viewer"))
    db.add(EnvironmentAssignment(user_id=alex.id, environment_id=envs[2].id, permission_level="admin"))
    db.commit()

    # 4. Application Tiles
    tiles = [
        ApplicationTile(
            name="Payment Simulator & Webhooks",
            url="https://staging-pay.internal.local",
            icon="CreditCard",
            category="Core Services",
            description="Simulates Visa, Mastercard, and Rupay authorization flows with customizable response delays and error triggers.",
            environment_id=envs[0].id,
            health_check_url="https://staging-pay.internal.local/healthz",
            health_status="healthy",
            access_policy="all_authenticated"
        ),
        ApplicationTile(
            name="Kafka Event Flow Inspector",
            url="https://kafka-ui.internal.local",
            icon="Radio",
            category="Observability",
            description="Web-based event streaming browser for Kafka topics, consumer lag tracking, and dead letter queue replay.",
            environment_id=None,
            health_check_url="https://kafka-ui.internal.local/actuator/health",
            health_status="healthy",
            access_policy="all_authenticated"
        ),
        ApplicationTile(
            name="Swagger / OpenAPI Explorer",
            url="https://api-docs.internal.local/docs",
            icon="FileCode2",
            category="APIs",
            description="Unified interactive API specification for internal microservices with instant Bearer token authorization.",
            environment_id=envs[0].id,
            health_check_url="https://api-docs.internal.local/health",
            health_status="healthy",
            access_policy="all_authenticated"
        ),
        ApplicationTile(
            name="WireMock Response Simulator",
            url="https://mock-services.internal.local",
            icon="Cpu",
            category="Simulators",
            description="Dynamic stubbing and mocking for downstream third-party banking networks, credit bureaus, and SMS gateways.",
            environment_id=envs[1].id,
            health_check_url="https://mock-services.internal.local/__admin/health",
            health_status="healthy",
            access_policy="all_authenticated"
        ),
        ApplicationTile(
            name="Redis Cluster Commander",
            url="https://redis-ui.internal.local",
            icon="Database",
            category="Observability",
            description="Inspect cached user sessions, distributed lock TTLs, and rate limiting counters in real-time.",
            environment_id=None,
            health_check_url="https://redis-ui.internal.local/ping",
            health_status="healthy",
            access_policy="admin_only"
        ),
        ApplicationTile(
            name="SMS OTP & Email Relay Testbed",
            url="https://mailhog-sms.internal.local",
            icon="Mail",
            category="QA Tools",
            description="Catches all outgoing 2FA SMS tokens and onboarding verification emails in isolated test sandbox.",
            environment_id=envs[2].id,
            health_check_url="https://mailhog-sms.internal.local/api/v2/messages",
            health_status="healthy",
            access_policy="all_authenticated"
        ),
    ]
    db.add_all(tiles)
    db.commit()

    # 5. PPT Presentations
    ppts = [
        Presentation(
            title="Q4 2026 Core Infrastructure Modernization & NOC Architecture",
            description="Strategic architectural review of our multi-region AWS setup, high-availability Redis clusters, and zero-trust VPC peering.",
            category="Technical Presentations",
            tags=["Architecture", "AWS", "NOC", "Infra"],
            uploader_name="Shyam Sundar Tyagi",
            uploader_email="shyam.tyagi@company.com",
            version="v2.1",
            download_url="/storage/decks/q4-infra-arch.pptx",
            thumbnail_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
            slide_count=28,
            size_mb=6.8
        ),
        Presentation(
            title="PCI-DSS v4.0 Compliance in AWS Sandbox Environments",
            description="Security guidelines for tokenization, secret isolation in AWS Secrets Manager, and audit trail retention.",
            category="Customer Presentations",
            tags=["Security", "Compliance", "PCI-DSS"],
            uploader_name="Alex Rivera",
            uploader_email="alex.rivera@company.com",
            version="v1.4",
            download_url="/storage/decks/pci-dss-sandbox.pptx",
            thumbnail_url="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
            slide_count=34,
            size_mb=9.2
        ),
        Presentation(
            title="Automated Test Orchestration with Playwright & Mock Services",
            description="Comprehensive guide to executing parallel end-to-end regression suites against dedicated test instances.",
            category="Training",
            tags=["QA", "Automation", "Playwright", "Testing"],
            uploader_name="Priya Sharma",
            uploader_email="dev.tester@company.com",
            version="v1.0",
            download_url="/storage/decks/automated-test-guide.pptx",
            thumbnail_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
            slide_count=22,
            size_mb=4.1
        ),
        Presentation(
            title="FinOps Strategy: Reducing Cloud Spend by 42% via Automatic Shutdown",
            description="Analysis of cloud waste in development tiers, ROI of scheduling non-prod environments, and reserved instance strategies.",
            category="Internal Reviews",
            tags=["FinOps", "Cost", "AWS", "GCP"],
            uploader_name="Elena Rostova",
            uploader_email="elena.finops@company.com",
            version="v3.0",
            download_url="/storage/decks/finops-cloud-spend.pptx",
            thumbnail_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80",
            slide_count=18,
            size_mb=5.4
        )
    ]
    db.add_all(ppts)
    db.commit()

    # 6. Videos
    videos = [
        Video(
            title="End-to-End Payment Gateway Transaction Simulation Demo",
            description="Deep dive into simulating edge-case refunds, chargebacks, and high-latency gateway timeouts in the staging sandbox.",
            category="Technical Demonstrations",
            tags=["Payments", "Simulator", "Demo"],
            uploader_name="Shyam Sundar Tyagi",
            duration_seconds=540,
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnail_url="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=400&auto=format&fit=crop&q=80",
            view_count=142
        ),
        Video(
            title="How to Start, Stop, and Inspect Your Test EC2 Environments",
            description="Walkthrough on using IEMP to manage instance states, read live logs, and avoid idle compute billing.",
            category="Product Demonstrations",
            tags=["IEMP", "Tutorial", "EC2"],
            uploader_name="Alex Rivera",
            duration_seconds=315,
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbnail_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
            view_count=289
        ),
        Video(
            title="Debugging Kafka Dead Letter Queues & Consumer Groups",
            description="Live troubleshooting session showing how to diagnose deserialization errors and replay stuck payment events.",
            category="Training",
            tags=["Kafka", "Troubleshooting", "DevOps"],
            uploader_name="David Chen",
            duration_seconds=720,
            video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumbnail_url="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80",
            view_count=98
        )
    ]
    db.add_all(videos)
    db.commit()

    # 7. Audit Events
    audit_events = [
        AuditEvent(
            actor_email="shyam.tyagi@company.com",
            action="ENV_START",
            resource_type="environment",
            resource_id="i-078a9c12df8b103e4",
            ip_address="192.168.1.42",
            status="SUCCESS",
            details={"environment_name": "Payment Gateway Staging", "instance_type": "c5.2xlarge", "region": "us-east-1"}
        ),
        AuditEvent(
            actor_email="dev.tester@company.com",
            action="ENV_STOP",
            resource_type="environment",
            resource_id="i-043b23c445109d98a",
            ip_address="192.168.1.88",
            status="SUCCESS",
            details={"environment_name": "Core Banking & Ledger Sandbox", "reason": "Testing complete for the sprint"}
        ),
        AuditEvent(
            actor_email="shyam.tyagi@company.com",
            action="AUTH_LOGIN",
            resource_type="user",
            resource_id="ZOHO-EMP-001",
            ip_address="192.168.1.42",
            status="SUCCESS",
            details={"method": "Zoho SSO", "provider": "zoho_accounts_oauth2"}
        ),
        AuditEvent(
            actor_email="alex.rivera@company.com",
            action="ENV_START",
            resource_type="environment",
            resource_id="i-091a329ef312bc901",
            ip_address="10.0.4.15",
            status="SUCCESS",
            details={"environment_name": "Identity & KYC Verification Testbed", "region": "eu-west-1"}
        ),
        AuditEvent(
            actor_email="elena.finops@company.com",
            action="COST_REPORT_EXPORT",
            resource_type="costing",
            resource_id="AWS_GCP_OCT_2026",
            ip_address="172.16.20.5",
            status="SUCCESS",
            details={"format": "CSV", "period": "October 2026", "granularity": "Daily"}
        ),
        AuditEvent(
            actor_email="david.chen@company.com",
            action="CONTENT_UPLOAD",
            resource_type="presentation",
            resource_id="pci-dss-sandbox.pptx",
            ip_address="192.168.2.19",
            status="SUCCESS",
            details={"title": "PCI-DSS v4.0 Compliance in AWS Sandbox Environments", "category": "Customer Presentations"}
        )
    ]
    db.add_all(audit_events)
    db.commit()

    # 8. Cloud Cost Records (Last 30 days of AWS and GCP daily spend)
    now = datetime.datetime.utcnow().date()
    cost_records = []
    
    aws_services = [
        ("EC2 - Elastic Compute", 45.0, "us-east-1", "i-078a9c12df8b103e4", "Payments Engineering"),
        ("RDS - PostgreSQL", 22.5, "us-east-1", None, "Core Services"),
        ("S3 - Standard Storage", 8.2, "global", None, "Platform QA"),
        ("EBS - Block Storage", 14.1, "us-east-1", "i-078a9c12df8b103e4", "Payments Engineering"),
        ("NAT Gateway & Networking", 11.4, "us-east-1", None, "Infrastructure"),
    ]
    
    gcp_services = [
        ("Compute Engine", 32.0, "europe-west1", "i-091a329ef312bc901", "Security & Compliance"),
        ("BigQuery Analytics", 18.5, "us-central1", None, "Risk & ML Ops"),
        ("Google Kubernetes Engine", 28.0, "asia-south1", None, "Platform QA"),
        ("Cloud Storage", 5.6, "global", None, "Technical Enablement"),
    ]

    for day_offset in range(30, -1, -1):
        record_date = (now - datetime.timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        # Add AWS records
        for svc, base_cost, region, env_id, team in aws_services:
            jitter = random.uniform(0.9, 1.15)
            cost_records.append(CloudCostRecord(
                provider="AWS",
                service=svc,
                region=region,
                project_or_account="aws-prod-iemp-account",
                team=team,
                environment_id=1 if env_id else None,
                date=record_date,
                amount=round(base_cost * jitter, 2),
                currency="USD",
                cost_basis="actual"
            ))

        # Add GCP records
        for svc, base_cost, region, env_id, team in gcp_services:
            jitter = random.uniform(0.88, 1.12)
            cost_records.append(CloudCostRecord(
                provider="GCP",
                service=svc,
                region=region,
                project_or_account="gcp-data-analytics-01",
                team=team,
                environment_id=3 if env_id else None,
                date=record_date,
                amount=round(base_cost * jitter, 2),
                currency="USD",
                cost_basis="actual"
            ))

    db.add_all(cost_records)
    db.commit()
    print("Database seeded successfully with all PRD test data!")
    db.close()

if __name__ == "__main__":
    init_db_and_seed()
