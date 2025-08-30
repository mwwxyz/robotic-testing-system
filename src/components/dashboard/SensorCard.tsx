import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  unit: string;
  rate: string;
  status: boolean;
  sessionActive: boolean;
  progressValue?: number;
  progressMax?: number;
  isBidirectional?: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon: Icon,
  value,
  unit,
  rate,
  status,
  sessionActive,
  progressValue = 0,
  progressMax = 100,
  isBidirectional = false
}) => {
  const getStatusBadge = () => {
    if (sessionActive && status) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>;
    } else if (!sessionActive) {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">STANDBY</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">ERROR</Badge>;
    }
  };

  const getProgressWidth = () => {
    if (isBidirectional) {
      return `${Math.abs(progressValue / progressMax) * 100}%`;
    }
    return `${Math.min((progressValue / progressMax) * 100, 100)}%`;
  };

  const getProgressMargin = () => {
    if (isBidirectional && progressValue < 0) {
      return `${(100 + (progressValue / progressMax * 100)) / 2}%`;
    }
    return isBidirectional ? '50%' : '0%';
  };

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-gray-900">{title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">NO DATA</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-light text-gray-900 mb-2">
            {sessionActive ? value : '---'}
          </div>
          <div className="text-sm text-gray-500">{unit}</div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{isBidirectional ? `-${progressMax}` : '0'}</span>
            <span>{progressMax}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                title.includes('Force') ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ 
                width: getProgressWidth(),
                marginLeft: getProgressMargin()
              }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <div className="text-gray-500">Rate</div>
            <div className="font-medium">{rate}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500">Status</div>
            {getStatusBadge()}
          </div>
        </div>
        
        {!sessionActive && (
          <div className="mt-3 text-xs text-gray-400">Waiting for data...</div>
        )}
      </CardContent>
    </Card>
  );
};