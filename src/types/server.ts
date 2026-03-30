export interface ServerConfig {
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  local?: boolean;
}

export interface RemoteMetrics {
  hostname: string;
  cpu: { usage: number; cores: number; speed: number };
  memory: { total: number; used: number; free: number; usedPercent: number };
  uptime: number;
  loadAvg: number[];
  timestamp: number;
}

export interface ServerPool {
  local: boolean;
  servers: ServerConfig[];
}
