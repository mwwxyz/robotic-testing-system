"""
FastAPI dependencies for dependency injection.
Demonstrates advanced FastAPI patterns.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status

from app.core.events import data_manager, sensor_manager


def get_data_manager():
    """Dependency to get data manager instance."""
    if data_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data manager not initialized"
        )
    return data_manager


def get_sensor_manager():
    """Dependency to get sensor manager instance."""
    if sensor_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sensor manager not initialized"
        )
    return sensor_manager


def require_active_session():
    """Dependency to ensure an active recording session."""
    manager = get_data_manager()
    if not manager.recording:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active recording session"
        )
    return manager