import { exec } from 'child_process';
import { promisify } from 'util';
import { DockerContainer } from '../types';

const execAsync = promisify(exec);

export class DockerService {
  private enabled: boolean;
  private containerLimit: number;
  private mockContainers: DockerContainer[] = [
    { name: 'nginx-proxy', cpuPercent: 2.1, memUsage: '256MB', memLimit: '512MB', memPercent: 50, pids: 12, status: 'running' },
    { name: 'postgres-db', cpuPercent: 8.5, memUsage: '1.2GB', memLimit: '2GB', memPercent: 60, pids: 45, status: 'running' },
    { name: 'redis-cache', cpuPercent: 1.2, memUsage: '512MB', memLimit: '1GB', memPercent: 51, pids: 8, status: 'running' },
    { name: 'api-gateway', cpuPercent: 15.3, memUsage: '800MB', memLimit: '1GB', memPercent: 80, pids: 32, status: 'running' },
    { name: 'worker-1', cpuPercent: 22.4, memUsage: '1.5GB', memLimit: '2GB', memPercent: 75, pids: 64, status: 'running' },
    { name: 'worker-2', cpuPercent: 18.7, memUsage: '1.4GB', memLimit: '2GB', memPercent: 70, pids: 58, status: 'running' },
    { name: 'mongodb-primary', cpuPercent: 12.1, memUsage: '3GB', memLimit: '4GB', memPercent: 75, pids: 28, status: 'running' },
    { name: 'kafka-broker', cpuPercent: 25.6, memUsage: '2GB', memLimit: '3GB', memPercent: 66, pids: 95, status: 'running' },
    { name: 'zookeeper', cpuPercent: 3.4, memUsage: '256MB', memLimit: '512MB', memPercent: 50, pids: 15, status: 'running' },
    { name: 'elasticsearch', cpuPercent: 45.2, memUsage: '4GB', memLimit: '6GB', memPercent: 66, pids: 128, status: 'running' }
  ];

  constructor(enabled: boolean = true, containerLimit: number = 10) {
    this.enabled = enabled;
    this.containerLimit = containerLimit;
  }

  async getContainerStats(): Promise<DockerContainer[]> {
    if (!this.enabled) {
      return this.getMockContainers();
    }

    try {
      const { stdout } = await execAsync('docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.PIDs}}"');
      const containers = this.parseDockerStats(stdout);
      return containers.slice(0, this.containerLimit);
    } catch (error) {
      return this.getMockContainers();
    }
  }

  private parseDockerStats(output: string): DockerContainer[] {
    const lines = output.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(',');
      if (parts.length < 5) return null;

      const [name, cpuStr, memUsage, memPerc, pids] = parts;
      const [used, limit] = memUsage.split(' / ');

      return {
        name: name.trim(),
        cpuPercent: parseFloat(cpuStr.replace('%', '')) || 0,
        memUsage: used.trim(),
        memLimit: limit.trim(),
        memPercent: parseFloat(memPerc.replace('%', '')) || 0,
        pids: parseInt(pids.trim(), 10) || 0,
        status: 'running'
      };
    }).filter((c): c is DockerContainer => c !== null);
  }

  getMockContainers(): DockerContainer[] {
    return this.mockContainers.map(container => ({
      ...container,
      cpuPercent: Math.max(0, container.cpuPercent + (Math.random() - 0.5) * 5),
      memPercent: Math.max(0, Math.min(100, container.memPercent + (Math.random() - 0.5) * 3))
    }));
  }
}
