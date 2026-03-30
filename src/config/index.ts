import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { DashboardConfig } from '../types';
import { ServerConfig, ServerPool } from '../types/server';

export interface AppConfig extends DashboardConfig {
  servers: ServerPool;
  selectedServer: number;
}

const CONFIG_PATH = path.join(__dirname, '../../config.yml');
const SERVERS_PATH = path.join(__dirname, '../../servers.yml');

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const config = loadDashboardConfig();
  const servers = loadServersConfig();

  let serversConfig: any = {};
  try {
    const serversFile = fs.readFileSync(SERVERS_PATH, 'utf8');
    const parsed = yaml.parse(serversFile);
    serversConfig = parsed;
  } catch (error) {}

  cachedConfig = { 
    ...config, 
    servers,
    selectedServer: serversConfig.dashboard?.selectedServer || 0
  };
  return cachedConfig;
}

function loadDashboardConfig(): DashboardConfig {
  try {
    const configFile = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.parse(configFile) as DashboardConfig;
  } catch (error) {
    console.warn('Config file not found, using defaults');
    return getDefaultConfig();
  }
}

function loadServersConfig(): ServerPool {
  try {
    const serversFile = fs.readFileSync(SERVERS_PATH, 'utf8');
    const parsed = yaml.parse(serversFile);
    return {
      local: true,
      servers: parsed.servers || []
    };
  } catch (error) {
    return {
      local: true,
      servers: [{ name: 'local', host: 'localhost', port: 22, username: '', local: true }]
    };
  }
}

function getDefaultConfig(): DashboardConfig {
  return {
    dashboard: {
      refreshInterval: 1000,
      mockMode: true
    },
    docker: {
      enabled: true,
      containerLimit: 10
    },
    system: {
      cpuHistoryLength: 60,
      memoryHistoryLength: 60
    },
    searchEngines: {
      google: { url: 'https://www.google.com', enabled: true },
      bing: { url: 'https://www.bing.com', enabled: true },
      yahoo: { url: 'https://www.yahoo.com', enabled: true }
    },
    mongodb: {
      enabled: false,
      connectionString: 'mongodb://localhost:27017',
      database: 'app'
    },
    kafka: {
      enabled: false,
      brokers: ['localhost:9092'],
      groupId: 'dashboard-consumer'
    },
    theme: {
      borderColor: 'blue',
      titleColor: 'white',
      healthyColor: 'green',
      warningColor: 'yellow',
      criticalColor: 'red'
    }
  };
}

export function getThemeColors(config: DashboardConfig) {
  return {
    healthy: config.theme.healthyColor,
    warning: config.theme.warningColor,
    critical: config.theme.criticalColor,
    border: config.theme.borderColor,
    title: config.theme.titleColor
  };
}

export function getServerList(): ServerConfig[] {
  const config = loadConfig();
  return config.servers.servers;
}

export function getSelectedServer(): number {
  const config = loadConfig();
  return config.selectedServer || 0;
}
