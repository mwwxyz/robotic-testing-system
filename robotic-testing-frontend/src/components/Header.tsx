import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Play, Square, RotateCcw } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  sessionActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  sessionActive,
  onStart,
  onStop,
  onReset
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Robotic Testing System
          </h1>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!sessionActive ? (
            <Button onClick={onStart} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start Session</span>
            </Button>
          ) : (
            <Button 
              onClick={onStop} 
              variant="destructive" 
              className="flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Stop Session</span>
            </Button>
          )}
          
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </header>
  );
};