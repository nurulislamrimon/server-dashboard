import { SearchEngineLatency, MongoStatus, KafkaTopic, ProgressData } from '../types';

export class MockDataService {
  private searchHistory: SearchEngineLatency[] = [];
  private kafkaHistory: { timestamp: number; topics: KafkaTopic[] }[] = [];
  private maxHistoryLength: number = 60;

  private mongoStatus: MongoStatus = {
    new: 1247,
    inProcess: 342,
    failed: 28,
    completed: 8934
  };

  generateSearchLatencies(): SearchEngineLatency {
    const latency: SearchEngineLatency = {
      timestamp: Date.now(),
      google: 45 + Math.random() * 150 + Math.sin(Date.now() / 5000) * 30,
      bing: 32 + Math.random() * 80 + Math.cos(Date.now() / 4000) * 20,
      yahoo: 55 + Math.random() * 120 + Math.sin(Date.now() / 6000) * 40
    };

    this.searchHistory.push(latency);
    if (this.searchHistory.length > this.maxHistoryLength) {
      this.searchHistory.shift();
    }

    return latency;
  }

  getSearchHistory(): SearchEngineLatency[] {
    return [...this.searchHistory];
  }

  generateKafkaTopics(): KafkaTopic[] {
    const topics: KafkaTopic[] = [
      {
        name: 'user-events',
        inbound: Math.floor(500 + Math.random() * 500),
        processing: Math.floor(100 + Math.random() * 200),
        dlq: Math.floor(Math.random() * 20)
      },
      {
        name: 'order-updates',
        inbound: Math.floor(200 + Math.random() * 300),
        processing: Math.floor(50 + Math.random() * 100),
        dlq: Math.floor(Math.random() * 15)
      },
      {
        name: 'notifications',
        inbound: Math.floor(1000 + Math.random() * 1000),
        processing: Math.floor(300 + Math.random() * 400),
        dlq: Math.floor(Math.random() * 30)
      }
    ];

    this.kafkaHistory.push({ timestamp: Date.now(), topics });
    if (this.kafkaHistory.length > this.maxHistoryLength) {
      this.kafkaHistory.shift();
    }

    return topics;
  }

  getKafkaHistory(): { timestamp: number; topics: KafkaTopic[] }[] {
    return [...this.kafkaHistory];
  }

  updateMongoStatus(): MongoStatus {
    const delta = () => Math.floor((Math.random() - 0.3) * 10);
    
    this.mongoStatus = {
      new: Math.max(0, this.mongoStatus.new + delta()),
      inProcess: Math.max(0, Math.min(500, this.mongoStatus.inProcess + delta())),
      failed: Math.max(0, this.mongoStatus.failed + (Math.random() > 0.9 ? 1 : Math.random() > 0.5 ? -1 : 0)),
      completed: this.mongoStatus.completed + Math.floor(Math.random() * 5)
    };

    return { ...this.mongoStatus };
  }

  getProgressData(): ProgressData[] {
    const now = new Date();
    
    const yearProgress = (now.getMonth() * 30 + now.getDate()) / 365 * 100;
    const dayProgress = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
    const hourProgress = (now.getMinutes() * 60 + now.getSeconds()) / 3600 * 100;
    const minuteProgress = (now.getSeconds()) / 60 * 100;

    return [
      { label: 'YEAR', value: yearProgress, max: 100 },
      { label: 'DAY', value: dayProgress, max: 100 },
      { label: 'HOUR', value: hourProgress, max: 100 },
      { label: 'MIN', value: minuteProgress, max: 100 }
    ];
  }

  generateClockDisplay(): string {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  generateWeatherData(): { temp: number; condition: string } {
    const conditions = ['☀ SUNNY', '☁ CLOUDY', '🌧 RAINY', '❄ SNOWY', '⛅ PARTLY CLOUDY'];
    return {
      temp: Math.floor(15 + Math.random() * 20),
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    };
  }
}
