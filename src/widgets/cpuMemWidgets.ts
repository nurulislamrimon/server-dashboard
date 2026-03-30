import { CpuData, MemoryData } from '../types';

export class CpuGraphWidget {
  private cpuData: CpuData | null = null;
  private history: number[] = [];

  update(data: CpuData, history: number[]): void {
    this.cpuData = data;
    this.history = history;
  }

  getCurrentUsage(): number {
    return this.cpuData?.usage ?? 0;
  }

  getHistory(): number[] {
    return this.history;
  }

  getCpuInfo(): { cores: number; speed: number } {
    return {
      cores: this.cpuData?.cores ?? 0,
      speed: this.cpuData?.speed ?? 0
    };
  }

  getStatusColor(): string {
    const usage = this.getCurrentUsage();
    if (usage < 50) return 'green';
    if (usage < 80) return 'yellow';
    return 'red';
  }
}

export class MemGraphWidget {
  private memData: MemoryData | null = null;
  private history: number[] = [];

  update(data: MemoryData, history: number[]): void {
    this.memData = data;
    this.history = history;
  }

  getCurrentUsage(): number {
    return this.memData?.usedPercent ?? 0;
  }

  getHistory(): number[] {
    return this.history;
  }

  getMemInfo(): { total: string; used: string; free: string } {
    if (!this.memData) {
      return { total: '0 GB', used: '0 GB', free: '0 GB' };
    }
    return {
      total: this.formatBytes(this.memData.total),
      used: this.formatBytes(this.memData.used),
      free: this.formatBytes(this.memData.free)
    };
  }

  private formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  }

  getStatusColor(): string {
    const usage = this.getCurrentUsage();
    if (usage < 60) return 'green';
    if (usage < 85) return 'yellow';
    return 'red';
  }
}
