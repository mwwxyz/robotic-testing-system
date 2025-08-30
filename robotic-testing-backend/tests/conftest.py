"""
pytest configuration and shared fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import create_application


@pytest.fixture
def client():
    """Create a test client."""
    app = create_application()
    return TestClient(app)


@pytest.fixture
def sample_sensor_data():
    """Sample sensor data for testing."""
    return [
        {
            "timestamp": 1234567890.0,
            "sensor_type": "force",
            "value": 15.5
        },
        {
            "timestamp": 1234567891.0,
            "sensor_type": "motor",
            "value": 25.0
        },
        {
            "timestamp": 1234567892.0,
            "sensor_type": "camera",
            "value": {
                "image_id": 1001,
                "resolution": "640x480",
                "brightness": 128,
                "exposure": 1.0
            }
        }
    ]