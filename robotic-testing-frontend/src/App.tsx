import { useState } from 'react';
import { Header } from './components/Header';
import { TestSession } from './components/dashboard/TestSession';
import { SensorCard } from './components/dashboard/SensorCard';
import { DataIntegrityMonitor } from './components/dashboard/DataIntegrityMonitor';
import { Charts } from './components/dashboard/Charts';
import { useSensorData } from './hooks/useSensorData';
import { Zap, Activity, Camera } from 'lucide-react';

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    force_sensor: false,
    motor_controller: false,
    camera: false,
    recording: false
  });

  const {
    sensorData,
    validationResults,
    forceData,
    motorData,
    currentForceValue,
    currentMotorValue,
    resetData
  } = useSensorData(sessionActive);

  const startSession = () => {
    setSessionActive(true);
    setSystemStatus({
      force_sensor: true,
      motor_controller: true,
      camera: true,
      recording: true
    });
    setIsConnected(true);
  };

  const stopSession = () => {
    setSessionActive(false);
    setSystemStatus({
      force_sensor: false,
      motor_controller: false,
      camera: false,
      recording: false
    });
  };

  const resetSession = () => {
    setSessionActive(false);
    resetData();
    setSystemStatus({
      force_sensor: false,
      motor_controller: false,
      camera: false,
      recording: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header 
          isConnected={isConnected}
          sessionActive={sessionActive}
          onStart={startSession}
          onStop={stopSession}
          onReset={resetSession}
        />
        
        <TestSession 
          sessionActive={sessionActive}
          dataCount={sensorData.length}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard
            title="Force Sensor"
            icon={Zap}
            value={currentForceValue.toFixed(1)}
            unit="N"
            rate="10 Hz"
            status={systemStatus.force_sensor}
            sessionActive={sessionActive}
            progressValue={currentForceValue}
            progressMax={150}
          />
          
          <SensorCard
            title="Motor Controller"
            icon={Activity}
            value={currentMotorValue.toFixed(0)}
            unit="rpm"
            rate="5 Hz"
            status={systemStatus.motor_controller}
            sessionActive={sessionActive}
            progressValue={currentMotorValue}
            progressMax={100}
            isBidirectional={true}
          />
          
          <SensorCard
            title="Camera System"
            icon={Camera}
            value="640x480"
            unit="res"
            rate="1 Hz"
            status={systemStatus.camera}
            sessionActive={sessionActive}
          />
        </div>
        
        <DataIntegrityMonitor 
          validationResults={validationResults}
          sessionActive={sessionActive}
        />
        
        {sessionActive && (forceData.length > 0 || motorData.length > 0) && (
          <Charts 
            forceData={forceData}
            motorData={motorData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
