"""
Test validation functionality.
"""
import pytest
from app.services.validation import DataValidator
from app.models.sensor import SensorReading, SensorType, ValidationStatus


def test_force_validation_thresholds():
    """Test force validation against different thresholds."""
    validator = DataValidator()
    
    # Test normal force
    normal_force = SensorReading(
        timestamp=1234567890.0,
        sensor_type=SensorType.FORCE,
        value=30.0
    )
    result = validator.validate_reading(normal_force)
    assert result is None  # Should not trigger validation
    
    # Test warning threshold
    warning_force = SensorReading(
        timestamp=1234567891.0,
        sensor_type=SensorType.FORCE,
        value=65.0  # Above 80% of threshold (80 * 0.8 = 64)
    )
    result = validator.validate_reading(warning_force)
    assert result is not None
    assert result.status == ValidationStatus.WARNING
    
    # Test critical threshold
    critical_force = SensorReading(
        timestamp=1234567892.0,
        sensor_type=SensorType.FORCE,
        value=85.0  # Above 80N threshold
    )
    result = validator.validate_reading(critical_force)
    assert result is not None
    assert result.status == ValidationStatus.ERROR


def test_motor_validation():
    """Test motor validation logic."""
    validator = DataValidator()
    
    # Normal motor speed
    normal_motor = SensorReading(
        timestamp=1234567890.0,
        sensor_type=SensorType.MOTOR,
        value=30.0
    )
    result = validator.validate_reading(normal_motor)
    assert result is None
    
    # High motor speed (warning)
    high_motor = SensorReading(
        timestamp=1234567891.0,
        sensor_type=SensorType.MOTOR,
        value=60.0  # Above 55 RPM threshold
    )
    result = validator.validate_reading(high_motor)
    assert result is not None
    assert result.status == ValidationStatus.WARNING
    
    # Test negative motor speed (should still trigger if absolute value is high)
    negative_motor = SensorReading(
        timestamp=1234567892.0,
        sensor_type=SensorType.MOTOR,
        value=-60.0
    )
    result = validator.validate_reading(negative_motor)
    assert result is not None
    assert result.status == ValidationStatus.WARNING


def test_camera_validation():
    """Test camera validation logic."""
    validator = DataValidator()
    
    # Normal camera reading
    normal_camera = SensorReading(
        timestamp=1234567890.0,
        sensor_type=SensorType.CAMERA,
        value={
            "image_id": 1001,
            "resolution": "640x480",
            "brightness": 128,
            "exposure": 1.0
        }
    )
    result = validator.validate_reading(normal_camera)
    assert result is None
    
    # Low brightness (warning)
    low_brightness = SensorReading(
        timestamp=1234567891.0,
        sensor_type=SensorType.CAMERA,
        value={
            "image_id": 1002,
            "resolution": "640x480",
            "brightness": 20,  # Below 30
            "exposure": 1.5
        }
    )
    result = validator.validate_reading(low_brightness)
    assert result is not None
    assert result.status == ValidationStatus.WARNING
    assert "Low lighting" in result.message
    
    # High brightness (overexposure warning)
    high_brightness = SensorReading(
        timestamp=1234567892.0,
        sensor_type=SensorType.CAMERA,
        value={
            "image_id": 1003,
            "resolution": "640x480",
            "brightness": 250,  # Above 240
            "exposure": 0.5
        }
    )
    result = validator.validate_reading(high_brightness)
    assert result is not None
    assert result.status == ValidationStatus.WARNING
    assert "Overexposed" in result.message