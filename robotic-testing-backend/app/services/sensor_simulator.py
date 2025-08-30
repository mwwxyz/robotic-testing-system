"""
Advanced sensor simulation service.
Demonstrates Python threading, async programming, and design patterns.
"""
import asyncio
import threading
import time
import random
import math
from typing import Callable, Optional, Dict, Any
from abc import ABC, abstractmethod

from app.models.sensor import SensorReading, SensorType, CameraMetadata
from app.core.config import settings


class BaseSensorSimulator(ABC):
    """Abstract base class for sensor simulators."""
    
    def __init__(self, sensor_type: SensorType, rate_hz: float, callback: Callable):
        self.sensor_type = sensor_type
        self.rate_hz = rate_hz
        self.callback = callback
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self._loop = None

    @abstractmethod
    def generate_data(self) -> Any:
        """Generate sensor-specific data."""
        pass

    def start(self):
        """Start the sensor simulation."""
        if self.running:
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run_simulation, daemon=True)
        self.thread.start()

    def stop(self):
        """Stop the sensor simulation."""
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)

    def _run_simulation(self):
        """Internal simulation loop."""
        interval = 1.0 / self.rate_hz
        
        while self.running:
            try:
                data = self.generate_data()
                reading = SensorReading(
                    timestamp=time.time(),
                    sensor_type=self.sensor_type,
                    value=data
                )
                
                # Send data to callback (async safe)
                if asyncio.iscoroutinefunction(self.callback):
                    try:
                        # Try to run in existing event loop
                        loop = asyncio.get_event_loop()
                        asyncio.create_task(self.callback(reading))
                    except RuntimeError:
                        # No event loop running, create a new one
                        asyncio.run(self.callback(reading))
                else:
                    self.callback(reading)
                
                time.sleep(interval)
                
            except Exception as e:
                print(f"Error in {self.sensor_type} simulator: {e}")


class ForceSensorSimulator(BaseSensorSimulator):
    """Force sensor with realistic physics simulation."""
    
    def __init__(self, callback: Callable):
        super().__init__(SensorType.FORCE, settings.FORCE_SENSOR_HZ, callback)
        self.baseline_force = 10.0
        self.noise_amplitude = 2.0
        self.spike_probability = 0.05
        
    def generate_data(self) -> float:
        """Generate force data with spikes and noise."""
        # Base force with some drift
        base = self.baseline_force + math.sin(time.time() * 0.1) * 3.0
        
        # Add realistic noise
        noise = random.gauss(0, self.noise_amplitude)
        
        # Occasional force spikes (contact events)
        if random.random() < self.spike_probability:
            spike = random.uniform(80, 200)
            return round(spike, 2)
        
        force = max(0, base + noise)
        return round(force, 2)


class MotorSensorSimulator(BaseSensorSimulator):
    """Motor controller with sinusoidal velocity profile."""
    
    def __init__(self, callback: Callable):
        super().__init__(SensorType.MOTOR, settings.MOTOR_SENSOR_HZ, callback)
        self.frequency = 0.5  # Hz for sine wave
        
    def generate_data(self) -> float:
        """Generate realistic motor velocity data."""
        # Sinusoidal velocity with some noise
        base_velocity = 50 * math.sin(time.time() * self.frequency * 2 * math.pi)
        noise = random.gauss(0, 1.0)
        
        velocity = base_velocity + noise
        return round(velocity, 2)


class CameraSensorSimulator(BaseSensorSimulator):
    """Camera system with realistic metadata."""
    
    def __init__(self, callback: Callable):
        super().__init__(SensorType.CAMERA, settings.CAMERA_SENSOR_HZ, callback)
        self.image_counter = 1000
        
    def generate_data(self) -> Dict[str, Any]:
        """Generate camera metadata."""
        self.image_counter += 1
        
        # Simulate varying lighting conditions
        brightness = max(50, min(255, 
            150 + random.gauss(0, 30) + 50 * math.sin(time.time() * 0.05)
        ))
        
        # Adaptive exposure based on brightness
        exposure = max(0.1, min(2.0, 1.0 - (brightness - 128) / 255))
        
        return {
            "image_id": self.image_counter,
            "resolution": "640x480",
            "brightness": int(brightness),
            "exposure": round(exposure, 2)
        }


class SensorManager:
    """Manages all sensor simulators with centralized control."""
    
    def __init__(self, data_callback: Callable):
        self.simulators: Dict[SensorType, BaseSensorSimulator] = {
            SensorType.FORCE: ForceSensorSimulator(data_callback),
            SensorType.MOTOR: MotorSensorSimulator(data_callback),
            SensorType.CAMERA: CameraSensorSimulator(data_callback)
        }
        self.running = False
    
    def start_all(self):
        """Start all sensor simulators."""
        self.running = True
        for simulator in self.simulators.values():
            simulator.start()
    
    def stop_all(self):
        """Stop all sensor simulators."""
        self.running = False
        for simulator in self.simulators.values():
            simulator.stop()
    
    def get_status(self) -> Dict[SensorType, bool]:
        """Get status of all simulators."""
        return {
            sensor_type: sim.running 
            for sensor_type, sim in self.simulators.items()
        }