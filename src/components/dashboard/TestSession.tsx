import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Database, Activity } from 'lucide-react';

interface TestSessionProps {
  sessionActive: boolean;
  dataCount: number;
}

export const TestSession: React.FC<TestSessionProps> = ({
  sessionActive,
  dataCount
}) => {
  const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState<string>('00:00:00');

  React.useEffect(() => {
    if (sessionActive && !sessionStartTime) {
      setSessionStartTime(Date.now());
    } else if (!sessionActive) {
      setSessionStartTime(null);
      setElapsedTime('00:00:00');
    }
  }, [sessionActive, sessionStartTime]);

  React.useEffect(() => {
    if (!sessionActive || !sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime]);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Test Session</span>
          </CardTitle>
          <Badge 
            variant={sessionActive ? 'default' : 'secondary'}
            className={sessionActive ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {sessionActive ? 'RECORDING' : 'STOPPED'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Duration</span>
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              {elapsedTime}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Data Points</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dataCount.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center md:col-span-1 col-span-2">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {sessionActive ? 'Data Collection Active' : 'Ready to Start'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};