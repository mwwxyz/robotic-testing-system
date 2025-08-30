"""
Professional data management service.
Demonstrates Python design patterns, async programming, and data handling.
"""
import asyncio
import csv
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from app.models.sensor import SensorReading, ValidationResult, SystemStatus
from app.services.validation import DataValidator
from app.core.config import settings


class DataManager:
    """Centralized data management with validation and export capabilities."""
    
    def __init__(self):
        self.sensor_data: List[SensorReading] = []
        self.validation_results: List[ValidationResult] = []
        self.websocket_connections: List[Any] = []
        self.recording = False
        self.session_start_time: Optional[float] = None
        
        # Initialize validator
        self.validator = DataValidator()
        
        # Ensure export directory exists
        Path(settings.DATA_EXPORT_PATH).mkdir(parents=True, exist_ok=True)
    
    async def add_sensor_data(self, reading: SensorReading):
        """Add sensor reading with validation and broadcasting."""
        # Store data if recording
        if self.recording:
            self.sensor_data.append(reading)
            
            # Maintain maximum data points
            if len(self.sensor_data) > settings.MAX_DATA_POINTS:
                self.sensor_data = self.sensor_data[-settings.MAX_DATA_POINTS:]
        
        # Always validate incoming data
        validation_result = self.validator.validate_reading(reading)
        if validation_result:
            self.validation_results.append(validation_result)
            await self._broadcast_validation(validation_result)
        
        # Broadcast sensor data to connected clients
        await self._broadcast_sensor_data(reading)
    
    async def start_recording(self):
        """Start data recording session."""
        self.recording = True
        self.session_start_time = asyncio.get_event_loop().time()
        self.sensor_data.clear()
        self.validation_results.clear()
        
        await self._broadcast_system_status()
    
    async def stop_recording(self) -> Dict[str, Any]:
        """Stop recording and return session summary."""
        self.recording = False
        session_duration = None
        
        if self.session_start_time:
            session_duration = asyncio.get_event_loop().time() - self.session_start_time
        
        await self._broadcast_system_status()
        
        return {
            "total_readings": len(self.sensor_data),
            "session_duration": session_duration,
            "validation_alerts": len(self.validation_results)
        }
    
    def export_to_csv(self, filename: Optional[str] = None) -> str:
        """Export sensor data to CSV file."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"sensor_data_{timestamp}.csv"
        
        filepath = Path(settings.DATA_EXPORT_PATH) / filename
        
        with open(filepath, 'w', newline='') as csvfile:
            fieldnames = ['timestamp', 'sensor_type', 'value', 'datetime', 'session_time']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for reading in self.sensor_data:
                writer.writerow({
                    'timestamp': reading.timestamp,
                    'sensor_type': reading.sensor_type.value,
                    'value': json.dumps(reading.value) if isinstance(reading.value, dict) else reading.value,
                    'datetime': datetime.fromtimestamp(reading.timestamp).isoformat(),
                    'session_time': reading.timestamp - (self.session_start_time or reading.timestamp)
                })
        
        return str(filepath)
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get comprehensive data summary."""
        if not self.sensor_data:
            return {"message": "No data recorded"}
        
        # Count by sensor type
        sensor_counts = {}
        for reading in self.sensor_data:
            sensor_type = reading.sensor_type.value
            sensor_counts[sensor_type] = sensor_counts.get(sensor_type, 0) + 1
        
        # Calculate session duration
        session_duration = None
        if len(self.sensor_data) > 1:
            session_duration = self.sensor_data[-1].timestamp - self.sensor_data[0].timestamp
        
        return {
            "total_readings": len(self.sensor_data),
            "sensor_breakdown": sensor_counts,
            "validation_alerts": len(self.validation_results),
            "session_duration_seconds": session_duration,
            "recording_active": self.recording,
            "connected_clients": len(self.websocket_connections)
        }
    
    async def add_websocket_connection(self, websocket):
        """Add WebSocket connection for broadcasting."""
        self.websocket_connections.append(websocket)
    
    async def remove_websocket_connection(self, websocket):
        """Remove WebSocket connection."""
        if websocket in self.websocket_connections:
            self.websocket_connections.remove(websocket)
    
    async def _broadcast_sensor_data(self, reading: SensorReading):
        """Broadcast sensor data to all connected clients."""
        if not self.websocket_connections:
            return
        
        message = {
            'type': 'sensor_data',
            'data': reading.dict()
        }
        
        # Remove disconnected clients while broadcasting
        active_connections = []
        for websocket in self.websocket_connections:
            try:
                await websocket.send_text(json.dumps(message))
                active_connections.append(websocket)
            except:
                pass  # Connection closed
        
        self.websocket_connections = active_connections
    
    async def _broadcast_validation(self, validation: ValidationResult):
        """Broadcast validation results."""
        message = {
            'type': 'validation',
            'data': validation.dict()
        }
        await self._broadcast_message(message)
    
    async def _broadcast_system_status(self):
        """Broadcast current system status."""
        status = SystemStatus(
            force_sensor=True,
            motor_controller=True,
            camera=True,
            recording=self.recording,
            uptime_seconds=asyncio.get_event_loop().time() - (self.session_start_time or 0),
            data_points_collected=len(self.sensor_data)
        )
        
        message = {
            'type': 'system_status',
            'data': status.dict()
        }
        await self._broadcast_message(message)
    
    async def _broadcast_message(self, message: Dict[str, Any]):
        """Generic message broadcasting."""
        if not self.websocket_connections:
            return
        
        active_connections = []
        for websocket in self.websocket_connections:
            try:
                await websocket.send_text(json.dumps(message))
                active_connections.append(websocket)
            except:
                pass
        
        self.websocket_connections = active_connections