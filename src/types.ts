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

export interface Script {
  id: string;
  name: string;
  path: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: number;
}

export interface SecurityScan {
  id: string;
  target: string;
  vulnerabilities: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}
