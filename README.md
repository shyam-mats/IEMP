# Internal Environment Management Platform (IEMP)

> **Version 1.1** — Enterprise Self-Service Cloud Testbeds, Application Launcher & Multi-Cloud FinOps Portal.

---

## 🌟 Executive Overview
**IEMP** is a centralized, self-service developer portal designed for enterprise engineering, QA, and FinOps teams. It eliminates the need for developers and testers to have direct AWS Console access to manage dedicated EC2 test environments, prevents avoidable cloud spend, unifies internal tool access, and provides transparent multi-cloud (AWS + GCP) cost visibility with Zoho SSO authentication.

---

## 🚀 Key Modules & Architecture

```
IEMP Platform
├── 1. Executive Dashboard           → Live running VM counts, MTD cloud spend, tool launcher, recent audit log
├── 2. Environment Lifecycle        → Dedicated AWS EC2 instances, start/stop with confirmation, state polling & health checks
├── 3. Testing App Launcher         → Configurable tiles with categories (Core, Observability, APIs, QA) and health indicators
├── 4. PPT Presentation Catalog     → Upload, tag, search, slide preview modal, and authorized downloads
├── 5. Video Demonstration Catalog  → Internal training videos with embedded HTML5 player and thumbnail cards
├── 6. Multi-Cloud FinOps (Costing) → AWS Cost Explorer + GCP BigQuery billing, daily trends, service breakdown, run-rate calculator
├── 7. Append-Only Audit Trail      → Searchable audit records (who clicked start/stop, log-ins, tile creations, CSV exports)
└── 8. Administration & Zoho SSO    → RBAC role assignment, employee directory, and access approvals
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 | Ultra-responsive dark theme with glassmorphism, responsive grid layouts, and micro-interactions. |
| **Backend API** | Python 3.14, FastAPI, Pydantic v2, SQLAlchemy | High-performance async REST API, validation, and security enforcement on every endpoint. |
| **Database** | SQLite (default out-of-the-box) / PostgreSQL (production ready) | Storage for users, environment registry, operations, tool tiles, decks, videos, and billing aggregates. |
| **Cloud Integrations** | AWS Boto3 (EC2, Cost Explorer) & GCP BigQuery client | Real cloud integration hooks with high-fidelity simulated fallback for offline sandbox testing. |
| **Auth & Identity** | Zoho SSO (OAuth 2.0 / OpenID Connect) | Enterprise employee authentication with role impersonation demo switcher. |

---

## 📦 Project Structure

```
/Users/shyamsundartyagi/IEMP
├── backend/
│   ├── main.py                  # FastAPI server entry point & CORS configuration
│   ├── database.py              # SQLAlchemy engine & session factory (SQLite / PostgreSQL)
│   ├── models.py                # Database models for all 8 PRD entities
│   ├── schemas.py               # Pydantic request & response models
│   ├── seed_data.py             # Rich enterprise initial test data generator
│   ├── requirements.txt         # Python dependencies
│   ├── services/
│   │   ├── aws_service.py       # AWS EC2 start/stop/describe with Boto3 + simulated state machine
│   │   └── health_service.py    # Synthetic HTTP/TCP application health checks
│   └── routers/
│       ├── auth.py              # Zoho SSO routes + persona role switcher
│       ├── environments.py      # EC2 lifecycle start/stop/history routes
│       ├── applications.py      # Tool launcher CRUD & launch tracking
│       ├── presentations.py     # PPT catalog & download tracking
│       ├── videos.py            # Video library & view counter
│       ├── costs.py             # FinOps summaries, trends, and CSV export
│       ├── audit.py             # Audit trail search, details, and CSV export
│       └── admin.py             # User directory & RBAC role editor
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Dark mode theme & metadata
│   │   │   ├── globals.css      # Glassmorphism utilities & glowing accents
│   │   │   └── page.tsx         # Unified dashboard viewport & interactive state
│   │   ├── lib/
│   │   │   └── api.ts           # Typed API client connecting to backend
│   │   └── components/
│   │       ├── Navbar.tsx           # Cloud health indicators & role persona simulator
│   │       ├── SidebarNav.tsx       # Navigation tabs with RBAC permission gates
│   │       ├── DashboardView.tsx    # KPI metric cards & quick actions
│   │       ├── EnvironmentsView.tsx # AWS EC2 instance cards with start/stop & confirmation
│   │       ├── TestingToolsView.tsx # Application launcher tiles with category filters
│   │       ├── PPTCatalogView.tsx   # Slide previews, metadata, and PPTX downloads
│   │       ├── VideoCatalogView.tsx # Embedded HTML5 video player modal
│   │       ├── CloudCostingView.tsx # Daily AWS vs GCP trend chart & run-rate calculator
│   │       ├── AuditTrailView.tsx   # Immutable audit table & CSV export
│   │       └── AdminView.tsx        # Zoho SSO status & employee RBAC assignments
│   ├── package.json
│   └── tailwind.config.ts
│
└── docker-compose.yml           # Production container orchestration
```

---

## 🏃 Running Locally

### 1. Backend Server (FastAPI)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check: [http://localhost:8000/](http://localhost:8000/)

### 2. Frontend Web Portal (Next.js)
```bash
cd frontend
npm run dev -- -p 3000
```
* Web Portal: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Operational Guarantees
1. **Zero AWS Console Access for Testers**: All start/stop operations route through the backend using narrowly scoped IAM roles.
2. **Stop ≠ Terminate**: EC2 instances only transition to `stopped`, preserving all attached EBS volumes.
3. **App Readiness vs. EC2 State**: Instances report `running` when AWS activates the hypervisor, but the app is only marked `ready` after HTTP health probes succeed.
4. **Append-Only Audit Trail**: Every authentication, start/stop event, tool launch, and content download is recorded with the Zoho employee email and timestamp.
