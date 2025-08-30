import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  Play, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Zap,
  Settings,
  Camera,
  Plus,
  Users
} from 'lucide-react';

interface SensorData {
  timestamp: number;
  value: number | object;
  sensor_type: string;
}

interface SystemStatus {
  force_sensor: boolean;
  motor_controller: boolean;
  camera: boolean;
  recording: boolean;
}

interface ValidationResult {
  sensor_type: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

const RoboticTestingApp: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    force_sensor: false,
    motor_controller: false,
    camera: false,
    recording: false
  });
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [forceData, setForceData] = useState<Array<{time: number, value: number}>>([]);
  const [motorData, setMotorData] = useState<Array<{time: number, value: number}>>([]);
  const [cameraData, setCameraData] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentForceValue, setCurrentForceValue] = useState<number>(0);
  const [currentMotorValue, setCurrentMotorValue] = useState<number>(0);

  // Synthetic data generation
  useEffect(() => {
    let interval: number;
    
    if (sessionActive) {
      interval = setInterval(() => {
        generateSyntheticData();
      }, 200); // Generate data every 200ms for smoother updates
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive]);

  const generateSyntheticData = () => {
    const now = Date.now();
    const timeInSeconds = now / 1000;
    
    // Force sensor - smooth sine wave with realistic noise and occasional spikes
    const baseForce = 15 + 8 * Math.sin(timeInSeconds * 0.3) + 3 * Math.sin(timeInSeconds * 0.7);
    const noise = (Math.random() - 0.5) * 1.5;
    const spike = Math.random() > 0.998 ? Math.random() * 30 : 0; // Rare spikes
    const forceValue = Math.max(0, baseForce + noise + spike);
    
    setCurrentForceValue(forceValue);
    setForceData(prev => {
      const newData = [...prev, { time: now, value: forceValue }];
      return newData.slice(-60); // Keep last 60 points (12 seconds at 200ms intervals)
    });
    
    // Motor controller - smooth sinusoidal pattern
    const motorValue = 45 * Math.sin(timeInSeconds * 0.4) + 15 * Math.sin(timeInSeconds * 0.8);
    setCurrentMotorValue(motorValue);
    setMotorData(prev => {
      const newData = [...prev, { time: now, value: motorValue }];
      return newData.slice(-60); // Keep last 60 points
    });
    
    // Update sensor data arrays
    const forceData: SensorData = {
      timestamp: timeInSeconds,
      value: Math.round(forceValue * 10) / 10,
      sensor_type: 'force'
    };
    
    const motorData: SensorData = {
      timestamp: timeInSeconds,
      value: Math.round(motorValue * 100) / 100,
      sensor_type: 'motor'
    };
    
    setSensorData(prev => [...prev.slice(-200), forceData, motorData]);
    
    // Camera data (1 Hz - every 1 second)
    if (Math.floor(timeInSeconds) !== Math.floor((timeInSeconds - 0.2))) {
      const frameNumber = Math.floor(timeInSeconds) % 1000;
      const cameraValue = {
        image_id: `IMG_${String(frameNumber).padStart(4, '0')}`,
        resolution: '640x480',
        brightness: Math.floor(Math.random() * 50) + 180, // Higher brightness for good conditions
        exposure: Math.round((Math.random() * 0.8 + 0.2) * 100) / 100, // 0.2-1.0s
        focus: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100, // 0.7-1.0 (good focus)
        timestamp: new Date().toISOString(),
        quality: Math.floor(Math.random() * 15) + 85, // 85-100% quality
        file_size: Math.round((Math.random() * 1.5 + 1.2) * 100) / 100, // 1.2-2.7 MB
        scene: ['Assembly Line', 'Quality Check', 'Component Test', 'Safety Monitor', 'Precision Measure'][Math.floor(Math.random() * 5)]
      };
      setCameraData(cameraValue);
      
      const cameraData: SensorData = {
        timestamp: timeInSeconds,
        value: cameraValue,
        sensor_type: 'camera'
      };
      setSensorData(prev => [...prev.slice(-200), cameraData]);
    }

    // Generate validation results occasionally
    if (Math.random() > 0.98) { // Less frequent validation updates
      const validations = [
        {
          sensor_type: 'force',
          status: forceValue > 30 ? 'warning' as const : 'valid' as const,
          message: forceValue > 30 ? 'Force spike detected' : 'Force readings within normal range',
          timestamp: timeInSeconds
        },
        {
          sensor_type: 'motor',
          status: Math.abs(motorValue) > 40 ? 'warning' as const : 'valid' as const,
          message: Math.abs(motorValue) > 40 ? 'Motor velocity approaching limits' : 'Motor performance nominal',
          timestamp: timeInSeconds
        },
        {
          sensor_type: 'camera',
          status: 'valid' as const,
          message: 'Image capture successful',
          timestamp: timeInSeconds
        }
      ];
      
      const randomValidation = validations[Math.floor(Math.random() * validations.length)];
      setValidationResults(prev => [...prev.slice(-10), randomValidation]);
    }
  };

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
    setSensorData([]);
    setValidationResults([]);
    setForceData([]);
    setMotorData([]);
    setCameraData(null);
    setCurrentForceValue(0);
    setCurrentMotorValue(0);
    setSystemStatus({
      force_sensor: false,
      motor_controller: false,
      camera: false,
      recording: false
    });
  };

  const getStatusBadge = (status: boolean) => {
    if (sessionActive && status) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>;
    } else if (!sessionActive) {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">STANDBY</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">ERROR</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Robotic Testing System</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isConnected && (
              <Badge variant="destructive" className="bg-red-500 text-white">
                DISCONNECTED
              </Badge>
            )}
            {isConnected && !sessionActive && (
              <Badge className="bg-gray-500 text-white">STANDBY</Badge>
            )}
            {sessionActive && (
              <Badge className="bg-green-500 text-white">ACTIVE</Badge>
            )}
            
            <Button 
              onClick={startSession}
              disabled={sessionActive}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
            <Button 
              onClick={stopSession}
              disabled={!sessionActive}
              size="sm"
              variant="outline"
              className="border-gray-300"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
            <Button 
              onClick={resetSession}
              size="sm"
              variant="outline"
              className="border-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* WebSocket Error */}
        {!isConnected && !sessionActive && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              WebSocket Error: websocket error
            </AlertDescription>
          </Alert>
        )}

        {/* Test Session */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-gray-900">Test Session</CardTitle>
              </div>
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-1" />
                New Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!sessionActive ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active session</h3>
                <p className="text-gray-500">Create a new session to start collecting data</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-green-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Session Active</h3>
                <p className="text-gray-500">Collecting data from {sensorData.length} sensor readings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Force Sensor */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-gray-900">Force Sensor</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">{sessionActive ? 'STREAMING' : 'NO DATA'}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {sessionActive ? currentForceValue.toFixed(1) : '---'}
                </div>
                <div className="text-sm text-gray-500">N</div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0</span>
                  <span>150</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((currentForceValue / 150) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">Rate</div>
                  <div className="font-medium">10 Hz</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">Status</div>
                  {getStatusBadge(systemStatus.force_sensor)}
                </div>
              </div>
              
              {!sessionActive && (
                <div className="mt-3 text-xs text-gray-400">Waiting for data...</div>
              )}
            </CardContent>
          </Card>

          {/* Motor Controller */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-gray-900">Motor Controller</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">{sessionActive ? 'STREAMING' : 'NO DATA'}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {sessionActive ? currentMotorValue.toFixed(0) : '---'}
                </div>
                <div className="text-sm text-gray-500">rpm</div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>-100</span>
                  <span>100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.abs(currentMotorValue / 100) * 100}%`,
                      marginLeft: currentMotorValue < 0 ? `${(100 + currentMotorValue) / 2}%` : '50%'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">Rate</div>
                  <div className="font-medium">5 Hz</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">Status</div>
                  {getStatusBadge(systemStatus.motor_controller)}
                </div>
              </div>
              
              {!sessionActive && (
                <div className="mt-3 text-xs text-gray-400">Waiting for data...</div>
              )}
            </CardContent>
          </Card>

          {/* Camera System */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-gray-900">Camera System</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">
                    {sessionActive && cameraData ? `${cameraData.quality}% QUALITY` : 'NO DATA'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-2xl font-light text-gray-900 mb-1">
                  {sessionActive && cameraData ? cameraData.image_id : '---'}
                </div>
                <div className="text-xs text-gray-500">Latest Capture</div>
              </div>
              
              {sessionActive && cameraData ? (
                <>
                  {/* Visual Camera Indicator */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded border-2 border-blue-300 flex items-center justify-center relative">
                      <Camera className="w-6 h-6 text-blue-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Scene Description */}
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-900">{cameraData.scene}</div>
                    <div className="text-xs text-gray-500">Current Scene</div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Resolution:</span>
                      <span className="text-gray-900">{cameraData.resolution}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Brightness:</span>
                      <span className="text-gray-900">{cameraData.brightness}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Exposure:</span>
                      <span className="text-gray-900">{cameraData.exposure}s</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Focus:</span>
                      <span className="text-gray-900">{cameraData.focus}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">File Size:</span>
                      <span className="text-gray-900">{cameraData.file_size} MB</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-4 text-center py-4">
                  <div className="w-16 h-12 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-400">Resolution: 640x480</div>
                  <div className="text-xs text-gray-400 mt-1">Awaiting capture...</div>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">Rate</div>
                  <div className="font-medium">1 Hz</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">Status</div>
                  {getStatusBadge(systemStatus.camera)}
                </div>
              </div>
              
              {!sessionActive && (
                <div className="mt-3 text-xs text-gray-400">Waiting for data...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Integrity Monitor */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-gray-900">Data Integrity Monitor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {validationResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No validation results available</div>
                {sessionActive && (
                  <div className="text-xs text-gray-400 mt-2">Monitoring data integrity...</div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {validationResults.slice(-5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.status === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {result.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {result.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <div>
                        <div className="font-medium text-sm capitalize">{result.sensor_type}</div>
                        <div className="text-xs text-gray-500">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(result.timestamp * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        {sessionActive && (forceData.length > 0 || motorData.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Force Sensor Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Motor Velocity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={motorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoboticTestingApp;
