"""
Configuration management using Pydantic Settings.
Demonstrates Python best practices for configuration.
"""
import os
from typing import List
from datetime import datetime
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # App info
    PROJECT_NAME: str = "Robotic Testing System"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Sensor settings
    FORCE_SENSOR_HZ: float = 10.0
    MOTOR_SENSOR_HZ: float = 5.0
    CAMERA_SENSOR_HZ: float = 1.0
    
    # Data settings
    MAX_DATA_POINTS: int = 10000
    DATA_EXPORT_PATH: str = "./data/exports/"
    
    # Validation thresholds
    FORCE_THRESHOLD_HIGH: float = 80.0
    FORCE_THRESHOLD_LOW: float = 0.0
    MOTOR_THRESHOLD: float = 55.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @staticmethod
    def get_current_timestamp() -> str:
        """Get current timestamp in ISO format."""
        return datetime.now().isoformat()

    def get_sensor_intervals(self) -> dict:
        """Get sensor intervals in seconds."""
        return {
            'force': 1.0 / self.FORCE_SENSOR_HZ,
            'motor': 1.0 / self.MOTOR_SENSOR_HZ,
            'camera': 1.0 / self.CAMERA_SENSOR_HZ
        }


settings = Settings()