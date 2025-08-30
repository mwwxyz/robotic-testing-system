export interface SensorData {
  timestamp: number;
  value: number | object;
  sensor_type: string;
}

export interface SystemStatus {
  force_sensor: boolean;
  motor_controller: boolean;
  camera: boolean;
  recording: boolean;
}

export interface ValidationResult {
  sensor_type: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export interface ChartDataPoint {
  time: number;
  value: number;
}