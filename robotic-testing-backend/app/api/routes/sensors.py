"""
Sensor data API endpoints.
Demonstrates REST API patterns and data aggregation.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta

from app.models.sensor import SensorReading, SensorType, ValidationResult
from app.core import events

router = APIRouter()


@router.get("/readings")
async def get_sensor_readings(
    sensor_type: Optional[SensorType] = Query(None, description="Filter by sensor type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of readings"),
    start_time: Optional[float] = Query(None, description="Start timestamp filter"),
    end_time: Optional[float] = Query(None, description="End timestamp filter")
) -> List[SensorReading]:
    """Get sensor readings with optional filtering."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    readings = events.data_manager.sensor_data.copy()
    
    # Apply filters
    if sensor_type:
        readings = [r for r in readings if r.sensor_type == sensor_type]
    
    if start_time:
        readings = [r for r in readings if r.timestamp >= start_time]
    
    if end_time:
        readings = [r for r in readings if r.timestamp <= end_time]
    
    # Apply limit
    readings = readings[-limit:]
    
    return readings


@router.get("/readings/latest")
async def get_latest_readings() -> Dict[str, Any]:
    """Get the latest reading from each sensor type."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    latest_readings = {}
    
    for sensor_type in SensorType:
        # Find the most recent reading for this sensor type
        sensor_readings = [r for r in events.data_manager.sensor_data if r.sensor_type == sensor_type]
        if sensor_readings:
            latest_readings[sensor_type.value] = sensor_readings[-1]
        else:
            latest_readings[sensor_type.value] = None
    
    return {
        "latest_readings": latest_readings,
        "timestamp": datetime.now().isoformat(),
        "total_readings": len(events.data_manager.sensor_data)
    }


@router.get("/readings/aggregated")
async def get_aggregated_data(
    sensor_type: SensorType = Query(..., description="Sensor type to aggregate"),
    interval_seconds: int = Query(60, ge=1, le=3600, description="Aggregation interval in seconds"),
    hours_back: int = Query(1, ge=1, le=24, description="Hours of data to include")
) -> Dict[str, Any]:
    """Get aggregated sensor data (averages, min, max) over time intervals."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Calculate time range
    end_time = datetime.now().timestamp()
    start_time = end_time - (hours_back * 3600)
    
    # Filter readings
    readings = [
        r for r in events.data_manager.sensor_data 
        if r.sensor_type == sensor_type and start_time <= r.timestamp <= end_time
    ]
    
    if not readings:
        return {"message": "No data found for the specified criteria"}
    
    # Group readings by time intervals
    aggregated_data = []
    current_interval_start = start_time
    
    while current_interval_start < end_time:
        interval_end = current_interval_start + interval_seconds
        
        # Get readings in this interval
        interval_readings = [
            r for r in readings 
            if current_interval_start <= r.timestamp < interval_end
        ]
        
        if interval_readings:
            # Calculate aggregations (only for numeric values)
            numeric_values = [
                r.value for r in interval_readings 
                if isinstance(r.value, (int, float))
            ]
            
            if numeric_values:
                aggregated_data.append({
                    "interval_start": current_interval_start,
                    "interval_end": interval_end,
                    "count": len(interval_readings),
                    "average": sum(numeric_values) / len(numeric_values),
                    "min": min(numeric_values),
                    "max": max(numeric_values),
                    "timestamp": datetime.fromtimestamp(current_interval_start).isoformat()
                })
        
        current_interval_start = interval_end
    
    return {
        "sensor_type": sensor_type.value,
        "interval_seconds": interval_seconds,
        "hours_back": hours_back,
        "total_intervals": len(aggregated_data),
        "data": aggregated_data
    }


@router.get("/status")
async def get_sensors_status() -> Dict[str, Any]:
    """Get detailed status of all sensors."""
    if not events.sensor_manager or not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Get sensor status
    sensor_status = events.sensor_manager.get_status()
    
    # Calculate data rates
    data_rates = {}
    current_time = datetime.now().timestamp()
    one_minute_ago = current_time - 60
    
    for sensor_type in SensorType:
        recent_readings = [
            r for r in events.data_manager.sensor_data 
            if r.sensor_type == sensor_type and r.timestamp > one_minute_ago
        ]
        data_rates[sensor_type.value] = len(recent_readings)
    
    return {
        "sensors": {
            sensor_type.value: {
                "active": sensor_status.get(sensor_type, False),
                "readings_per_minute": data_rates.get(sensor_type.value, 0)
            }
            for sensor_type in SensorType
        },
        "system": {
            "recording": events.data_manager.recording,
            "total_readings": len(events.data_manager.sensor_data),
            "connected_clients": len(events.data_manager.websocket_connections)
        },
        "timestamp": datetime.now().isoformat()
    }


@router.get("/validation")
async def get_validation_results(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of validation results")
) -> List[ValidationResult]:
    """Get recent validation results."""
    if not events.data_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return events.data_manager.validation_results[-limit:]


@router.post("/simulate")
async def trigger_simulation_event(
    sensor_type: SensorType = Query(..., description="Sensor to simulate event for"),
    event_type: str = Query("spike", description="Type of event to simulate")
) -> Dict[str, Any]:
    """Manually trigger a simulation event for testing."""
    if not events.sensor_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # This could be extended to inject specific test scenarios
    # For now, just return a confirmation
    return {
        "message": f"Simulation event triggered for {sensor_type.value}",
        "event_type": event_type,
        "timestamp": datetime.now().isoformat(),
        "note": "Event simulation not yet implemented - would modify sensor behavior"
    }