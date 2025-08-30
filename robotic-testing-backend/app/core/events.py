"""
Application startup and shutdown event handlers.
Demonstrates proper resource management in FastAPI.
"""
import asyncio
from app.services.sensor_simulator import SensorManager
from app.services.data_manager import DataManager

# Global instances
sensor_manager: SensorManager = None
data_manager: DataManager = None


async def startup_handler():
    """Handle application startup."""
    global sensor_manager, data_manager
    
    print("🚀 Starting Robotic Testing System...")
    
    # Initialize data manager
    data_manager = DataManager()
    
    # Initialize sensor manager with data callback
    sensor_manager = SensorManager(data_manager.add_sensor_data)
    
    print("✅ System initialized successfully")


async def shutdown_handler():
    """Handle application shutdown."""
    global sensor_manager, data_manager
    
    print("🛑 Shutting down Robotic Testing System...")
    
    # Stop all sensors
    if sensor_manager:
        sensor_manager.stop_all()
    
    # Save any pending data
    if data_manager and data_manager.recording:
        await data_manager.stop_recording()
    
    print("✅ System shutdown complete")