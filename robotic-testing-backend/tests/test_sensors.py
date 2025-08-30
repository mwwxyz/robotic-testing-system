"""
Test sensor functionality.
"""
import pytest
from app.models.sensor import SensorReading, SensorType, ValidationStatus
from app.services.validation import DataValidator
from app.services.sensor_simulator import ForceSensorSimulator


def test_sensor_reading_validation():
    """Test sensor reading model validation."""
    # Valid reading
    reading = SensorReading(
        timestamp=1234567890.0,
        sensor_type=SensorType.FORCE,
        value=15.5
    )
    assert reading.timestamp == 1234567890.0
    assert reading.sensor_type == SensorType.FORCE
    assert reading.value == 15.5
    
    # Invalid timestamp
    with pytest.raises(ValueError):
        SensorReading(
            timestamp=-1.0,
            sensor_type=SensorType.FORCE,
            value=15.5
        )


def test_data_validator():
    """Test data validation logic."""
    validator = DataValidator()
    
    # Normal force reading - should not trigger validation
    normal_reading = SensorReading(
        timestamp=1234567890.0,
        sensor_type=SensorType.FORCE,
        value=15.5
    )
    result = validator.validate_reading(normal_reading)
    assert result is None
    
    # High force reading - should trigger warning
    high_reading = SensorReading(
        timestamp=1234567891.0,
        sensor_type=SensorType.FORCE,
        value=70.0
    )
    result = validator.validate_reading(high_reading)
    assert result is not None
    assert result.status == ValidationStatus.WARNING
    
    # Critical force reading - should trigger error
    critical_reading = SensorReading(
        timestamp=1234567892.0,
        sensor_type=SensorType.FORCE,
        value=100.0
    )
    result = validator.validate_reading(critical_reading)
    assert result is not None
    assert result.status == ValidationStatus.ERROR


def test_force_sensor_simulator():
    """Test force sensor simulation."""
    collected_data = []
    
    def callback(reading):
        collected_data.append(reading)
    
    simulator = ForceSensorSimulator(callback)
    
    # Generate some data
    for _ in range(5):
        data = simulator.generate_data()
        assert isinstance(data, float)
        assert data >= 0.0  # Force should be non-negative