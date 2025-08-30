"""
Utility helper functions.
Demonstrates Python utility patterns and best practices.
"""
import time
import json
from typing import Any, Dict, List, Optional
from datetime import datetime
from pathlib import Path


def timestamp_to_datetime(timestamp: float) -> datetime:
    """Convert Unix timestamp to datetime object."""
    return datetime.fromtimestamp(timestamp)


def datetime_to_timestamp(dt: datetime) -> float:
    """Convert datetime object to Unix timestamp."""
    return dt.timestamp()


def format_duration(seconds: float) -> str:
    """Format duration in seconds to human-readable string."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f}m"
    else:
        hours = seconds / 3600
        return f"{hours:.1f}h"


def calculate_data_rate(readings: List[Any], time_window_seconds: int = 60) -> float:
    """Calculate data rate (readings per second) for recent readings."""
    if not readings:
        return 0.0
    
    current_time = time.time()
    cutoff_time = current_time - time_window_seconds
    
    recent_readings = [
        r for r in readings 
        if hasattr(r, 'timestamp') and r.timestamp > cutoff_time
    ]
    
    if not recent_readings:
        return 0.0
    
    return len(recent_readings) / time_window_seconds


def safe_json_serialize(obj: Any) -> str:
    """Safely serialize object to JSON, handling complex types."""
    def json_serializer(o):
        if hasattr(o, 'timestamp'):
            return o.timestamp
        elif hasattr(o, '__dict__'):
            return o.__dict__
        elif isinstance(o, (datetime,)):
            return o.isoformat()
        else:
            return str(o)
    
    try:
        return json.dumps(obj, default=json_serializer, indent=2)
    except Exception as e:
        return json.dumps({"error": f"Serialization failed: {str(e)}"})


def ensure_directory(path: str) -> Path:
    """Ensure directory exists, create if necessary."""
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def get_file_size_mb(file_path: str) -> float:
    """Get file size in megabytes."""
    try:
        size_bytes = Path(file_path).stat().st_size
        return size_bytes / (1024 * 1024)
    except FileNotFoundError:
        return 0.0


def validate_sensor_data_integrity(readings: List[Any]) -> Dict[str, Any]:
    """Validate the integrity of sensor data collection."""
    if not readings:
        return {"status": "no_data", "issues": []}
    
    issues = []
    
    # Check for time gaps
    timestamps = [r.timestamp for r in readings if hasattr(r, 'timestamp')]
    timestamps.sort()
    
    gaps = []
    for i in range(1, len(timestamps)):
        gap = timestamps[i] - timestamps[i-1]
        if gap > 5.0:  # Gap longer than 5 seconds
            gaps.append({
                "start": timestamps[i-1],
                "end": timestamps[i],
                "duration": gap
            })
    
    if gaps:
        issues.append(f"Found {len(gaps)} time gaps > 5 seconds")
    
    # Check for duplicate timestamps
    unique_timestamps = set(timestamps)
    if len(unique_timestamps) != len(timestamps):
        duplicates = len(timestamps) - len(unique_timestamps)
        issues.append(f"Found {duplicates} duplicate timestamps")
    
    # Check data distribution by sensor type
    sensor_counts = {}
    for reading in readings:
        if hasattr(reading, 'sensor_type'):
            sensor_type = reading.sensor_type
            sensor_counts[sensor_type] = sensor_counts.get(sensor_type, 0) + 1
    
    return {
        "status": "healthy" if not issues else "issues_found",
        "total_readings": len(readings),
        "time_span_seconds": timestamps[-1] - timestamps[0] if len(timestamps) > 1 else 0,
        "sensor_distribution": sensor_counts,
        "issues": issues,
        "time_gaps": gaps
    }