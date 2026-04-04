export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'command' | 'status' | 'error';
}

export interface DevOpsState {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  deployments: number;
  lastDeployment: string;
  cpuUsage: number;
  memoryUsage: number;
}
