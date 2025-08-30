"""
Session management API endpoints.
Demonstrates RESTful API design with FastAPI.
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import uuid
from datetime import datetime

from app.models.session import SessionRequest, SessionResponse, SessionSummary
from app.core import events

router = APIRouter()


@router.post("/start", response_model=SessionResponse)
async def start_session(session_request: SessionRequest = None):
    """Start a new data recording session."""
    if not events.data_manager or not events.sensor_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if events.data_manager.recording:
        raise HTTPException(status_code=400, detail="Session already in progress")
    
    # Generate session ID
    session_id = str(uuid.uuid4())
    
    # Start recording and sensors
    await events.data_manager.start_recording()
    events.sensor_manager.start_all()
    
    return SessionResponse(
        session_id=session_id,
        status="recording",
        started_at=datetime.now(),
        data_points=0
    )


@router.post("/stop", response_model=SessionSummary)
async def stop_session():
    """Stop the current recording session."""
    if not events.data_manager or not events.sensor_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if not events.data_manager.recording:
        raise HTTPException(status_code=400, detail="No active session to stop")
    
    # Stop sensors and recording
    events.sensor_manager.stop_all()
    session_data = await events.data_manager.stop_recording()
    
    return SessionSummary(
        session_id=str(uuid.uuid4()),
        total_readings=session_data["total_readings"],
        session_duration=session_data["session_duration"],
        validation_alerts=session_data["validation_alerts"],
        summary_stats=events.data_manager.get_data_summary()
    )


@router.get("/status")
async def get_session_status() -> Dict[str, Any]:
    """Get current session status."""
    if not events.data_manager or not events.sensor_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return {
        "recording": events.data_manager.recording,
        "sensors_active": events.sensor_manager.get_status(),
        "data_summary": events.data_manager.get_data_summary(),
        "validation_stats": events.data_manager.validator.get_validation_stats(),
        "connected_clients": len(events.data_manager.websocket_connections)
    }


@router.post("/reset")
async def reset_session():
    """Reset all session data and stop recording."""
    if not events.data_manager or not events.sensor_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Stop everything
    events.sensor_manager.stop_all()
    if events.data_manager.recording:
        await events.data_manager.stop_recording()
    
    # Clear data
    events.data_manager.sensor_data.clear()
    events.data_manager.validation_results.clear()
    
    return {
        "message": "Session reset successfully",
        "timestamp": datetime.now().isoformat()
    }


@router.get("/export/csv")
async def export_session_csv(background_tasks: BackgroundTasks):
    """Export current session data as CSV file."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if not events.data_manager.sensor_data:
        raise HTTPException(status_code=400, detail="No data to export")
    
    # Export data to CSV
    file_path = events.data_manager.export_to_csv()
    
    # Schedule file cleanup after download
    background_tasks.add_task(cleanup_export_file, file_path)
    
    return FileResponse(
        file_path,
        media_type='application/octet-stream',
        filename=file_path.split('/')[-1]
    )


@router.get("/summary", response_model=SessionSummary)
async def get_session_summary():
    """Get detailed session summary."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    summary_stats = events.data_manager.get_data_summary()
    
    return SessionSummary(
        session_id=str(uuid.uuid4()),
        total_readings=len(events.data_manager.sensor_data),
        session_duration=summary_stats.get("session_duration_seconds"),
        validation_alerts=len(events.data_manager.validation_results),
        summary_stats=summary_stats
    )


async def cleanup_export_file(file_path: str):
    """Clean up exported files after download."""
    import os
    import asyncio
    
    # Wait a bit before cleanup to ensure download completes
    await asyncio.sleep(60)
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to cleanup export file {file_path}: {e}")