"""
Data validation service.
Demonstrates Python validation patterns and business logic.
"""
from typing import Optional, Dict, Any
import time

from app.models.sensor import SensorReading, ValidationResult, ValidationStatus, SensorType
from app.core.config import settings


class DataValidator:
    """Advanced sensor data validation with configurable thresholds."""
    
    def __init__(self):
        self.validation_history: Dict[SensorType, list] = {
            SensorType.FORCE: [],
            SensorType.MOTOR: [],
            SensorType.CAMERA: []
        }
    
    def validate_reading(self, reading: SensorReading) -> Optional[ValidationResult]:
        """Validate a sensor reading and return result if noteworthy."""
        
        if reading.sensor_type == SensorType.FORCE:
            return self._validate_force_reading(reading)
        elif reading.sensor_type == SensorType.MOTOR:
            return self._validate_motor_reading(reading)
        elif reading.sensor_type == SensorType.CAMERA:
            return self._validate_camera_reading(reading)
        
        return None
    
    def _validate_force_reading(self, reading: SensorReading) -> Optional[ValidationResult]:
        """Validate force sensor reading."""
        force_value = reading.value
        current_time = time.time()
        
        # Store for trend analysis
        self.validation_history[SensorType.FORCE].append({
            'timestamp': current_time,
            'value': force_value
        })
        
        # Keep only last 50 readings for analysis
        if len(self.validation_history[SensorType.FORCE]) > 50:
            self.validation_history[SensorType.FORCE] = self.validation_history[SensorType.FORCE][-50:]
        
        # Critical threshold check
        if force_value > settings.FORCE_THRESHOLD_HIGH:
            return ValidationResult(
                sensor_type=SensorType.FORCE,
                status=ValidationStatus.ERROR,
                message=f"Critical force level: {force_value}N exceeds {settings.FORCE_THRESHOLD_HIGH}N",
                timestamp=current_time,
                details={
                    "threshold": settings.FORCE_THRESHOLD_HIGH,
                    "actual": force_value,
                    "severity": "critical"
                }
            )
        
        # Warning threshold
        elif force_value > settings.FORCE_THRESHOLD_HIGH * 0.8:
            return ValidationResult(
                sensor_type=SensorType.FORCE,
                status=ValidationStatus.WARNING,
                message=f"Force level {force_value}N approaching limit",
                timestamp=current_time,
                details={
                    "threshold": settings.FORCE_THRESHOLD_HIGH,
                    "actual": force_value,
                    "percentage": (force_value / settings.FORCE_THRESHOLD_HIGH) * 100
                }
            )
        
        # Check for rapid changes (spike detection)
        if len(self.validation_history[SensorType.FORCE]) >= 3:
            recent_values = [r['value'] for r in self.validation_history[SensorType.FORCE][-3:]]
            if self._detect_spike(recent_values):
                return ValidationResult(
                    sensor_type=SensorType.FORCE,
                    status=ValidationStatus.WARNING,
                    message="Force spike detected",
                    timestamp=current_time,
                    details={
                        "recent_values": recent_values,
                        "spike_detected": True
                    }
                )
        
        return None
    
    def _validate_motor_reading(self, reading: SensorReading) -> Optional[ValidationResult]:
        """Validate motor controller reading."""
        motor_value = abs(reading.value)  # Consider absolute value for threshold
        current_time = time.time()
        
        if motor_value > settings.MOTOR_THRESHOLD:
            return ValidationResult(
                sensor_type=SensorType.MOTOR,
                status=ValidationStatus.WARNING,
                message=f"Motor speed {reading.value}RPM approaching operational limits",
                timestamp=current_time,
                details={
                    "threshold": settings.MOTOR_THRESHOLD,
                    "actual": reading.value,
                    "absolute": motor_value
                }
            )
        
        return None
    
    def _validate_camera_reading(self, reading: SensorReading) -> Optional[ValidationResult]:
        """Validate camera system reading."""
        camera_data = reading.value
        current_time = time.time()
        
        # Check for extremely low or high brightness (indicates lighting issues)
        brightness = camera_data.get('brightness', 128)
        
        if brightness < 30:
            return ValidationResult(
                sensor_type=SensorType.CAMERA,
                status=ValidationStatus.WARNING,
                message=f"Low lighting detected: brightness {brightness}",
                timestamp=current_time,
                details={
                    "brightness": brightness,
                    "exposure": camera_data.get('exposure', 1.0),
                    "issue": "insufficient_lighting"
                }
            )
        elif brightness > 240:
            return ValidationResult(
                sensor_type=SensorType.CAMERA,
                status=ValidationStatus.WARNING,
                message=f"Overexposed image: brightness {brightness}",
                timestamp=current_time,
                details={
                    "brightness": brightness,
                    "exposure": camera_data.get('exposure', 1.0),
                    "issue": "overexposure"
                }
            )
        
        return None
    
    def _detect_spike(self, values: list) -> bool:
        """Detect if there's a significant spike in the last few values."""
        if len(values) < 3:
            return False
        
        # Calculate the change from first to last value
        change = abs(values[-1] - values[0])
        
        # Consider it a spike if change is more than 50N in a short time
        return change > 50
    
    def get_validation_stats(self) -> Dict[str, Any]:
        """Get validation statistics for monitoring."""
        total_validations = sum(len(history) for history in self.validation_history.values())
        
        return {
            "total_validations_performed": total_validations,
            "force_readings_analyzed": len(self.validation_history[SensorType.FORCE]),
            "motor_readings_analyzed": len(self.validation_history[SensorType.MOTOR]),
            "camera_readings_analyzed": len(self.validation_history[SensorType.CAMERA]),
            "validation_active": True
        }