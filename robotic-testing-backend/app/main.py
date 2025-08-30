"""
FastAPI main application entry point.
Demonstrates professional Python/FastAPI architecture.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.events import startup_handler, shutdown_handler
from app.api.routes import sensors, sessions, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    await startup_handler()
    yield
    # Shutdown
    await shutdown_handler()


def create_application() -> FastAPI:
    """Create FastAPI application with all configurations."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Professional robotic testing system backend",
        lifespan=lifespan
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["sensors"])
    app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
    app.include_router(websocket.router, prefix="/ws", tags=["websocket"])

    return app


app = create_application()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Robotic Testing System API",
        "version": settings.VERSION,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": settings.get_current_timestamp(),
        "services": {
            "sensor_simulator": True,
            "data_manager": True,
            "websocket": True
        }
    }