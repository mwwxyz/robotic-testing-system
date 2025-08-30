export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastHeartbeat: number;
  endpoint?: string;
}