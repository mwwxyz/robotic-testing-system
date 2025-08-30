import { useState, useEffect, useCallback } from 'react';
import type { SensorData, ValidationResult, ChartDataPoint } from '../types/sensor';
import { generateSyntheticData, generateValidationResult } from '../utils/syntheticData';

export const useSensorData = (sessionActive: boolean) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [forceData, setForceData] = useState<ChartDataPoint[]>([]);
  const [motorData, setMotorData] = useState<ChartDataPoint[]>([]);
  const [currentForceValue, setCurrentForceValue] = useState<number>(0);
  const [currentMotorValue, setCurrentMotorValue] = useState<number>(0);

  const addSensorData = useCallback((data: SensorData) => {
    setSensorData(prev => [...prev.slice(-100), data]);
    
    if (data.sensor_type === 'force' && typeof data.value === 'number') {
      setCurrentForceValue(data.value);
      setForceData(prev => [...prev.slice(-50), { time: Date.now(), value: data.value as number }]);
    } else if (data.sensor_type === 'motor' && typeof data.value === 'number') {
      setCurrentMotorValue(data.value);
      setMotorData(prev => [...prev.slice(-50), { time: Date.now(), value: data.value as number }]);
    }
  }, []);

  const resetData = useCallback(() => {
    setSensorData([]);
    setValidationResults([]);
    setForceData([]);
    setMotorData([]);
    setCurrentForceValue(0);
    setCurrentMotorValue(0);
  }, []);

  useEffect(() => {
    if (!sessionActive) return;

    const interval = setInterval(() => {
      const syntheticData = generateSyntheticData();
      if (syntheticData) {
        addSensorData(syntheticData);
      }

      // Generate validation results occasionally
      if (Math.random() > 0.98) {
        const validation = generateValidationResult();
        setValidationResults(prev => [...prev.slice(-10), validation]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sessionActive, addSensorData]);

  return {
    sensorData,
    validationResults,
    forceData,
    motorData,
    currentForceValue,
    currentMotorValue,
    resetData
  };
};