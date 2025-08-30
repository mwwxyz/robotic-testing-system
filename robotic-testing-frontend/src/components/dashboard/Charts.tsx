import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../../types/sensor';
import { TrendingUp, Zap, Activity } from 'lucide-react';

interface ChartsProps {
  forceData: ChartDataPoint[];
  motorData: ChartDataPoint[];
}

export const Charts: React.FC<ChartsProps> = ({
  forceData,
  motorData
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatForceData = forceData.map(point => ({
    time: formatTime(point.time),
    timestamp: point.time,
    force: point.value
  }));

  const formatMotorData = motorData.map(point => ({
    time: formatTime(point.time),
    timestamp: point.time,
    motor: point.value
  }));

  const combinedData = React.useMemo(() => {
    const combined = new Map();
    
    formatForceData.forEach(point => {
      combined.set(point.timestamp, { ...point });
    });
    
    formatMotorData.forEach(point => {
      const existing = combined.get(point.timestamp) || {};
      combined.set(point.timestamp, { ...existing, ...point });
    });
    
    return Array.from(combined.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [formatForceData, formatMotorData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Force Sensor Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatForceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                label={{ value: 'Force (N)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="force" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Motor Controller Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatMotorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                label={{ value: 'Speed (RPM)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="motor" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {combinedData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Combined Sensor Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  label={{ value: 'Force (N)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  label={{ value: 'Speed (RPM)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="force" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Force (N)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="motor" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Motor Speed (RPM)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};