import type { SensorData, ValidationResult } from '../types/sensor';

export const validateSensorData = (data: SensorData): ValidationResult => {
  const now = Date.now() / 1000;

  switch (data.sensor_type) {
    case 'force':
      const forceValue = data.value as number;
      if (forceValue > 100) {
        return {
          sensor_type: 'force',
          status: 'error',
          message: `Force reading ${forceValue}N exceeds safe limit`,
          timestamp: now
        };
      } else if (forceValue > 50) {
        return {
          sensor_type: 'force',
          status: 'warning',
          message: `Force reading ${forceValue}N approaching upper limit`,
          timestamp: now
        };
      }
      return {
        sensor_type: 'force',
        status: 'valid',
        message: 'Force readings within normal range',
        timestamp: now
      };

    case 'motor':
      const motorValue = Math.abs(data.value as number);
      if (motorValue > 80) {
        return {
          sensor_type: 'motor',
          status: 'warning',
          message: `Motor speed ${motorValue}rpm approaching limits`,
          timestamp: now
        };
      }
      return {
        sensor_type: 'motor',
        status: 'valid',
        message: 'Motor operating normally',
        timestamp: now
      };

    case 'camera':
      return {
        sensor_type: 'camera',
        status: 'valid',
        message: 'Image capture successful',
        timestamp: now
      };

    default:
      return {
        sensor_type: data.sensor_type,
        status: 'error',
        message: 'Unknown sensor type',
        timestamp: now
      };
  }
};