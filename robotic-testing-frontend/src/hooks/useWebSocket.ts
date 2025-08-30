import { useState, useEffect, useRef, useCallback } from 'react';
import type { SensorData } from '../types/sensor';

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (data: SensorData) => void;
  onConnectionChange?: (connected: boolean) => void;
  reconnectDelay?: number;
}

export const useWebSocket = ({
  url = 'ws://localhost:8080/ws',
  onMessage,
  onConnectionChange,
  reconnectDelay = 3000
}: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SensorData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        onConnectionChange?.(true);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: SensorData = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onConnectionChange?.(false);
        console.log('WebSocket disconnected');
        
        // Auto-reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectDelay);
    }
  }, [url, onMessage, onConnectionChange, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage
  };
};