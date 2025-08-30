"""
Session management models.
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SessionRequest(BaseModel):
    """Request to start a new session."""
    name: Optional[str] = Field(None, description="Optional session name")
    description: Optional[str] = Field(None, description="Session description")


class SessionResponse(BaseModel):
    """Session response model."""
    session_id: str
    status: str
    started_at: datetime
    duration_seconds: Optional[float] = None
    data_points: int = 0
    
    
class SessionSummary(BaseModel):
    """Complete session summary."""
    session_id: str
    total_readings: int
    session_duration: Optional[float]
    validation_alerts: int
    export_path: Optional[str] = None
    summary_stats: Dict[str, Any] = Field(default_factory=dict)