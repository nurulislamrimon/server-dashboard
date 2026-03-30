import { DockerContainer } from '../types';

export class DockerWidget {
  private containers: DockerContainer[] = [];

  update(containers: DockerContainer[]): void {
    this.containers = containers;
  }

  getContainers(): DockerContainer[] {
    return this.containers;
  }

  getTableData(): string[][] {
    return this.containers.map(c => [
      c.name.substring(0, 15).padEnd(15),
      `${c.cpuPercent.toFixed(1).padStart(6)}%`,
      `${c.memUsage}/${c.memLimit}`,
      c.pids.toString().padStart(4)
    ]);
  }

  getStatusSummary(): { running: number; total: number } {
    return {
      running: this.containers.filter(c => c.status === 'running').length,
      total: this.containers.length
    };
  }

  getCpuColor(cpuPercent: number): string {
    if (cpuPercent < 30) return 'green';
    if (cpuPercent < 70) return 'yellow';
    return 'red';
  }

  getMemColor(memPercent: number): string {
    if (memPercent < 60) return 'green';
    if (memPercent < 85) return 'yellow';
    return 'red';
  }
}
