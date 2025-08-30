"""
Pydantic models for sensor data.
Demonstrates advanced Python typing and validation.
"""
from typing import Dict, Any, Union, Literal
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class SensorType(str, Enum):
    """Sensor type enumeration."""
    FORCE = "force"
    MOTOR = "motor"
    CAMERA = "camera"


class ValidationStatus(str, Enum):
    """Validation status enumeration."""
    VALID = "valid"
    WARNING = "warning"
    ERROR = "error"


class SensorReading(BaseModel):
    """Base sensor reading model."""
    timestamp: float = Field(..., description="Unix timestamp")
    sensor_type: SensorType
    value: Union[float, int, Dict[str, Any]]
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        """Validate timestamp is reasonable."""
        if v <= 0:
            raise ValueError('Timestamp must be positive')
        return v

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ForceReading(SensorReading):
    """Force sensor specific reading."""
    sensor_type: Literal[SensorType.FORCE] = SensorType.FORCE
    value: float = Field(..., ge=0.0, le=1000.0, description="Force in Newtons")


class MotorReading(SensorReading):
    """Motor sensor specific reading."""
    sensor_type: Literal[SensorType.MOTOR] = SensorType.MOTOR
    value: float = Field(..., ge=-100.0, le=100.0, description="Velocity in RPM")


class CameraMetadata(BaseModel):
    """Camera metadata structure."""
    image_id: int = Field(..., ge=1000, le=9999)
    resolution: str = Field(..., pattern=r'^\d+x\d+$')
    brightness: int = Field(..., ge=0, le=255)
    exposure: float = Field(..., ge=0.1, le=2.0)


class CameraReading(SensorReading):
    """Camera sensor specific reading."""
    sensor_type: Literal[SensorType.CAMERA] = SensorType.CAMERA
    value: CameraMetadata


class ValidationResult(BaseModel):
    """Data validation result."""
    sensor_type: SensorType
    status: ValidationStatus
    message: str
    timestamp: float
    details: Dict[str, Any] = Field(default_factory=dict)


class SystemStatus(BaseModel):
    """System operational status."""
    force_sensor: bool = False
    motor_controller: bool = False
    camera: bool = False
    recording: bool = False
    uptime_seconds: float = 0.0
    data_points_collected: int = 0