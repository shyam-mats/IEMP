from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from seed_data import init_db_and_seed
from routers import (
    auth, environments, applications, presentations,
    videos, costs, audit, admin
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iemp")

app = FastAPI(
    title="Internal Environment Management Platform (IEMP) API",
    version="1.1.0",
    description="Centralized self-service portal API for cloud testing environments, tools, catalogs, and FinOps."
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all module routers
app.include_router(auth.router)
app.include_router(environments.router)
app.include_router(applications.router)
app.include_router(presentations.router)
app.include_router(videos.router)
app.include_router(costs.router)
app.include_router(audit.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing IEMP Database & Seeding initial PRD records...")
    init_db_and_seed()
    logger.info("IEMP API ready to serve requests.")

@app.get("/")
def health_check():
    return {
        "platform": "Internal Environment Management Platform (IEMP)",
        "version": "1.1.0",
        "status": "healthy",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
