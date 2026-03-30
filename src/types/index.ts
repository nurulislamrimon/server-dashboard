export interface DashboardConfig {
  dashboard: {
    refreshInterval: number;
    mockMode: boolean;
  };
  docker: {
    enabled: boolean;
    containerLimit: number;
  };
  system: {
    cpuHistoryLength: number;
    memoryHistoryLength: number;
  };
  searchEngines: {
    google: { url: string; enabled: boolean };
    bing: { url: string; enabled: boolean };
    yahoo: { url: string; enabled: boolean };
  };
  mongodb: {
    enabled: boolean;
    connectionString: string;
    database: string;
  };
  kafka: {
    enabled: boolean;
    brokers: string[];
    groupId: string;
  };
  theme: {
    borderColor: string;
    titleColor: string;
    healthyColor: string;
    warningColor: string;
    criticalColor: string;
  };
}

export interface TimeSeriesPoint {
  title: string;
  x: number;
  y: number;
}

export interface CpuData {
  usage: number;
  cores: number;
  speed: number;
}

export interface MemoryData {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

export interface DockerContainer {
  name: string;
  cpuPercent: number;
  memUsage: string;
  memLimit: string;
  memPercent: number;
  pids: number;
  status: string;
}

export interface SearchEngineLatency {
  timestamp: number;
  google: number;
  bing: number;
  yahoo: number;
}

export interface MongoStatus {
  new: number;
  inProcess: number;
  failed: number;
  completed: number;
}

export interface KafkaTopic {
  name: string;
  inbound: number;
  processing: number;
  dlq: number;
}

export interface ProgressData {
  label: string;
  value: number;
  max: number;
}

export interface WidgetBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export * from './server';
