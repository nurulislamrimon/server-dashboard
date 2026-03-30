import { SearchEngineLatency } from '../types';

export interface ChartData {
  title: string;
  x: string[];
  y: number[];
}

export class SearchLatencyWidget {
  private data: SearchEngineLatency[] = [];
  private maxPoints: number = 60;

  update(latencies: SearchEngineLatency[]): void {
    this.data = latencies.slice(-this.maxPoints);
  }

  getChartData(): ChartData[] {
    if (this.data.length === 0) {
      return [
        { title: 'Google', x: [], y: [] },
        { title: 'Bing', x: [], y: [] },
        { title: 'Yahoo', x: [], y: [] }
      ];
    }

    return [
      {
        title: 'Google',
        x: this.data.map((_, i) => i.toString()),
        y: this.data.map(d => Math.round(d.google))
      },
      {
        title: 'Bing',
        x: this.data.map((_, i) => i.toString()),
        y: this.data.map(d => Math.round(d.bing))
      },
      {
        title: 'Yahoo',
        x: this.data.map((_, i) => i.toString()),
        y: this.data.map(d => Math.round(d.yahoo))
      }
    ];
  }

  getLegend(): string[] {
    return ['Google', 'Bing', 'Yahoo'];
  }

  getLegendColors(): string[] {
    return ['yellow', 'magenta', 'cyan'];
  }
}
