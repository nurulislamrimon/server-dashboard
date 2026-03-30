import * as si from 'systeminformation';
import { CpuData, MemoryData } from '../types';

export class SystemService {
  private cpuHistory: number[] = [];
  private memHistory: number[] = [];
  private maxHistoryLength: number = 60;

  constructor(historyLength: number = 60) {
    this.maxHistoryLength = historyLength;
  }

  async getCpuData(): Promise<CpuData> {
    try {
      const load = await si.currentLoad();
      const cpu = await si.cpu();
      return {
        usage: Math.round(load.currentLoad * 100) / 100,
        cores: cpu.cores,
        speed: cpu.speed
      };
    } catch (error) {
      return { usage: 0, cores: 4, speed: 2.5 };
    }
  }

  async getMemoryData(): Promise<MemoryData> {
    try {
      const mem = await si.mem();
      return {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: (mem.used / mem.total) * 100
      };
    } catch (error) {
      return { total: 16 * 1024 * 1024 * 1024, used: 8 * 1024 * 1024 * 1024, free: 8 * 1024 * 1024 * 1024, usedPercent: 50 };
    }
  }

  updateCpuHistory(usage: number): number[] {
    this.cpuHistory.push(usage);
    if (this.cpuHistory.length > this.maxHistoryLength) {
      this.cpuHistory.shift();
    }
    return [...this.cpuHistory];
  }

  updateMemHistory(usage: number): number[] {
    this.memHistory.push(usage);
    if (this.memHistory.length > this.maxHistoryLength) {
      this.memHistory.shift();
    }
    return [...this.memHistory];
  }

  getCpuHistory(): number[] {
    return [...this.cpuHistory];
  }

  getMemHistory(): number[] {
    return [...this.memHistory];
  }
}
