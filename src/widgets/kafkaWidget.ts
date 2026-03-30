import { KafkaTopic } from '../types';

export interface ChartData {
  title: string;
  x: string[];
  y: number[];
}

export class KafkaWidget {
  private history: KafkaTopic[] = [];
  private maxHistoryLength: number = 60;

  update(topics: KafkaTopic[]): void {
    if (topics.length > 0) {
      this.history.push(...topics);
      if (this.history.length > this.maxHistoryLength * topics.length) {
        this.history = this.history.slice(-this.maxHistoryLength * topics.length);
      }
    }
  }

  getTopics(): KafkaTopic[] {
    return this.history.slice(-this.maxHistoryLength);
  }

  getChartData(): ChartData[] {
    const recentData = this.history.slice(-this.maxHistoryLength);
    
    if (recentData.length === 0) {
      return [
        { title: 'INBOUND', x: [], y: [] },
        { title: 'PROCESSING', x: [], y: [] },
        { title: 'DLQ', x: [], y: [] }
      ];
    }

    const inbound: number[] = [];
    const processing: number[] = [];
    const dlq: number[] = [];

    recentData.forEach((topic) => {
      inbound.push(topic.inbound);
      processing.push(topic.processing);
      dlq.push(topic.dlq);
    });

    return [
      { title: 'INBOUND', x: recentData.map((_, i) => i.toString()), y: inbound },
      { title: 'PROCESSING', x: recentData.map((_, i) => i.toString()), y: processing },
      { title: 'DLQ', x: recentData.map((_, i) => i.toString()), y: dlq }
    ];
  }

  getTopicNames(): string[] {
    const uniqueTopics = new Set(this.history.map(t => t.name));
    return Array.from(uniqueTopics);
  }
}
