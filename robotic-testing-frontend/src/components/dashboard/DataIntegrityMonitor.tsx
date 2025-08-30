import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import type { ValidationResult } from '../../types/sensor';
import { Shield, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface DataIntegrityMonitorProps {
  validationResults: ValidationResult[];
  sessionActive: boolean;
}

export const DataIntegrityMonitor: React.FC<DataIntegrityMonitorProps> = ({
  validationResults,
  sessionActive
}) => {
  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">VALID</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">WARNING</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">ERROR</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">UNKNOWN</Badge>;
    }
  };

  const getAlertVariant = (status: ValidationResult['status']): 'default' | 'destructive' => {
    return status === 'error' ? 'destructive' : 'default';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const recentResults = validationResults.slice(-3);
  const hasErrors = validationResults.some(result => result.status === 'error');
  const hasWarnings = validationResults.some(result => result.status === 'warning');

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Data Integrity Monitor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasErrors && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {validationResults.filter(r => r.status === 'error').length} Errors
              </Badge>
            )}
            {hasWarnings && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {validationResults.filter(r => r.status === 'warning').length} Warnings
              </Badge>
            )}
            {!hasErrors && !hasWarnings && sessionActive && (
              <Badge className="bg-green-100 text-green-800 border-green-200">All Good</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!sessionActive ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Data validation will begin when session starts</p>
          </div>
        ) : recentResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Waiting for validation results...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Validation Results</h4>
            {recentResults.map((result, index) => (
              <Alert key={index} variant={getAlertVariant(result.status)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {result.sensor_type} Sensor
                      </div>
                      <AlertDescription className="text-sm">
                        {result.message}
                      </AlertDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(result.status)}
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(result.timestamp)}
                    </span>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};