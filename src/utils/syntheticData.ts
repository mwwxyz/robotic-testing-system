import type { SensorData, ValidationResult } from '../types/sensor';

export const generateSyntheticData = (): SensorData | null => {
  const now = Date.now();
  
  // Force sensor (10 Hz simulation)
  if (Math.random() > 0.9) {
    const forceValue = Math.random() > 0.95 
      ? Math.random() * 150 + 100 // Spike
      : Math.random() * 20 + 5;   // Normal range
    
    return {
      timestamp: now / 1000,
      value: Math.round(forceValue * 10) / 10,
      sensor_type: 'force'
    };
  }
  
  // Motor controller (5 Hz simulation)
  if (Math.random() > 0.8) {
    const motorValue = Math.round(50 * Math.sin(now / 1000 * 0.5) * 100) / 100;
    return {
      timestamp: now / 1000,
      value: motorValue,
      sensor_type: 'motor'
    };
  }
  
  // Camera (1 Hz simulation)
  if (Math.random() > 0.99) {
    return {
      timestamp: now / 1000,
      value: {
        image_id: Math.floor(Math.random() * 9000) + 1000,
        resolution: '640x480',
        brightness: Math.floor(Math.random() * 205) + 50,
        exposure: Math.round(Math.random() * 1.9 * 100 + 10) / 100
      },
      sensor_type: 'camera'
    };
  }
  
  return null;
};

export const generateValidationResult = (): ValidationResult => {
  const validations = [
    {
      sensor_type: 'force',
      status: 'valid' as const,
      message: 'Force readings within normal range',
      timestamp: Date.now() / 1000
    },
    {
      sensor_type: 'motor',
      status: 'warning' as const,
      message: 'Motor velocity approaching limits',
      timestamp: Date.now() / 1000
    },
    {
      sensor_type: 'camera',
      status: 'valid' as const,
      message: 'Image capture successful',
      timestamp: Date.now() / 1000
    }
  ];
  
  return validations[Math.floor(Math.random() * validations.length)];
};