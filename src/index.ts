import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import { loadConfig, getThemeColors, getServerList } from './config';
import { SystemService, DockerService, MockDataService } from './services';
import { SSHService, LocalSystemService } from './services/sshService';
import { ServerConfig, RemoteMetrics } from './types/server';
import {
  SearchLatencyWidget,
  CpuGraphWidget,
  MemGraphWidget,
  MongoWidget,
  KafkaWidget,
  DockerWidget
} from './widgets';

export class Dashboard {
  private screen: blessed.Widgets.Screen;
  private config = loadConfig();
  private theme = getThemeColors(this.config);
  
  private systemService: SystemService;
  private dockerService: DockerService;
  private mockDataService: MockDataService;
  private sshService: SSHService;
  private localService: LocalSystemService;

  private servers: ServerConfig[] = [];
  private currentServerIndex: number = 0;
  private remoteMetrics: Map<string, RemoteMetrics> = new Map();

  private searchWidget: SearchLatencyWidget;
  private cpuWidget: CpuGraphWidget;
  private memWidget: MemGraphWidget;
  private mongoWidget: MongoWidget;
  private kafkaWidget: KafkaWidget;
  private dockerWidget: DockerWidget;

  private refreshInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  private lineChartSearch: any;
  private lineChartKafka: any;
  private cpuSparkline: any;
  private memSparkline: any;
  private progressGauges: any[] = [];
  private dockerTable: any;
  private clockText: any;
  private mongoGauges: any[] = [];
  private serverSelector: any;
  private statusBar: any;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: false,
      dockBorders: true,
      title: 'Server Dashboard - Real-time Monitoring',
      fullUnicode: true,
      ignoreDockContrast: true
    });

    this.servers = getServerList();
    this.systemService = new SystemService(this.config.system.cpuHistoryLength);
    this.dockerService = new DockerService(this.config.docker.enabled, this.config.docker.containerLimit);
    this.mockDataService = new MockDataService();
    this.sshService = new SSHService();
    this.localService = new LocalSystemService();

    this.searchWidget = new SearchLatencyWidget();
    this.cpuWidget = new CpuGraphWidget();
    this.memWidget = new MemGraphWidget();
    this.mongoWidget = new MongoWidget();
    this.kafkaWidget = new KafkaWidget();
    this.dockerWidget = new DockerWidget();

    this.setupWidgets();
    this.setupKeyboardControls();
    this.connectToCurrentServer();
    this.initializeHistory();
  }

  private initializeHistory(): void {
    const initialCpu = 30 + Math.random() * 40;
    const initialMem = 40 + Math.random() * 30;
    
    for (let i = 0; i < 30; i++) {
      const mockCpu = 30 + Math.random() * 40;
      const mockMem = 40 + Math.random() * 30;
      this.systemService.updateCpuHistory(mockCpu);
      this.systemService.updateMemHistory(mockMem);
    }
    
    this.initialized = true;
  }

  private async connectToCurrentServer(): Promise<void> {
    const server = this.servers[this.currentServerIndex];
    if (!server.local && server.host !== 'localhost') {
      try {
        await this.sshService.connect(server);
        console.log(chalk.green(`Connected to ${server.name} (${server.host})`));
      } catch (error) {
        console.log(chalk.red(`Failed to connect to ${server.name}: ${error}`));
      }
    }
  }

  private switchServer(index: number): void {
    if (index >= 0 && index < this.servers.length) {
      this.currentServerIndex = index;
      this.updateServerSelector();
      this.connectToCurrentServer();
    }
  }

  private updateServerSelector(): void {
    const serverNames = this.servers.map((s, i) => 
      i === this.currentServerIndex ? `[${s.name}]` : s.name
    ).join(' | ');
    
    if (this.serverSelector) {
      this.serverSelector.setContent(`Servers: ${serverNames}`);
    }
  }

  private setupWidgets(): void {
    const grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });

    this.serverSelector = grid.set(0, 0, 1, 12, blessed.box, {
      style: { bg: 'gray', fg: 'white' },
      content: `Servers: ${this.servers.map((s, i) => 
        i === this.currentServerIndex ? `[${s.name}]` : s.name
      ).join(' | ')}`,
      tags: true,
      align: 'center'
    });

    this.lineChartSearch = grid.set(1, 0, 5, 6, contrib.line, {
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      xLabelPadding: 1,
      yLabelPadding: 1,
      label: ' SEARCH RESPONSE TIME (ms) ',
      showLegend: true,
      legend: { top: 0, width: 30 }
    });

    this.clockText = grid.set(1, 6, 2, 6, blessed.text, {
      content: '{bold}{red-fg}00{/red-fg}:{yellow-fg}00{/yellow-fg}:{green-fg}00{/green-fg}{/bold}',
      tags: true,
      align: 'center',
      valign: 'middle',
      style: { bold: true, fg: 'white', bg: 'black' }
    });

    this.progressGauges = [
      { label: 'YEAR', color: 'cyan' },
      { label: 'DAY', color: 'green' },
      { label: 'HOUR', color: 'yellow' },
      { label: 'MIN', color: 'magenta' }
    ].map((item, i) => {
      return grid.set(3 + Math.floor(i * 0.7), 6, 1, 6, contrib.gauge, {
        label: ` ${item.label} `,
        gaugeWidth: 18,
        stack: false
      });
    });

    this.cpuSparkline = grid.set(6, 0, 3, 4, contrib.sparkline, {
      label: ' CPU HISTORY ',
      style: { line: 'green' }
    });

    this.memSparkline = grid.set(6, 4, 3, 4, contrib.sparkline, {
      label: ' MEMORY HISTORY ',
      style: { line: 'cyan' }
    });

    this.mongoGauges = [
      { label: 'NEW', color: 'cyan' },
      { label: 'PROCESS', color: 'yellow' },
      { label: 'FAILED', color: 'red' },
      { label: 'COMPLETED', color: 'green' }
    ].map((item, i) => {
      return grid.set(6, 8, 3, 4, contrib.gauge, {
        label: ` ${item.label} `,
        gaugeWidth: 15,
        stack: false,
        top: i * 0.75
      });
    });

    this.lineChartKafka = grid.set(9, 0, 3, 6, contrib.line, {
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      label: ' KAFKA IN-FLIGHT MESSAGES ',
      showLegend: true,
      legend: { top: 0, width: 40 }
    });

    this.dockerTable = grid.set(0, 9, 9, 3, contrib.table, {
      keys: true,
      label: ' DOCKER CONTAINERS ',
      border: { type: 'line', fg: this.theme.border },
      columnSpacing: 1,
      columnWidth: [14, 8, 14, 5]
    });

    this.statusBar = grid.set(9, 6, 3, 6, blessed.box, {
      border: { type: 'line', fg: this.theme.border },
      label: ' SYSTEM INFO ',
      align: 'center',
      valign: 'middle',
      style: { border: { fg: this.theme.border }, fg: 'white' }
    });

    const footerBox = grid.set(11, 0, 1, 12, blessed.box, {
      style: { bg: 'gray', fg: 'white' },
      content: ' [Q] Quit | [R] Refresh | [1-9] Switch Server | Dashboard v1.0.0 | Refresh: 1s',
      tags: true
    });
  }

  private setupKeyboardControls(): void {
    this.screen.key(['q', 'Q', 'C-c'], () => {
      this.stop();
      process.exit(0);
    });

    this.screen.key(['r', 'R'], () => {
      this.update();
    });

    this.screen.key(['escape'], () => {
      this.stop();
      process.exit(0);
    });

    for (let i = 1; i <= 9; i++) {
      this.screen.key([String(i)], () => {
        this.switchServer(i - 1);
      });
    }

    this.screen.key(['left'], () => {
      const newIndex = (this.currentServerIndex - 1 + this.servers.length) % this.servers.length;
      this.switchServer(newIndex);
    });

    this.screen.key(['right'], () => {
      const newIndex = (this.currentServerIndex + 1) % this.servers.length;
      this.switchServer(newIndex);
    });
  }

  private async update(): Promise<void> {
    try {
      const now = new Date();
      const timestamp = now.toISOString().split('T')[1].split('.')[0];

      const latency = this.mockDataService.generateSearchLatencies();
      this.searchWidget.update(this.mockDataService.getSearchHistory());
      
      const searchData = this.searchWidget.getChartData();
      if (searchData[0].y.length > 0) {
        this.lineChartSearch.setData(searchData[0], searchData[1], searchData[2]);
      }

      const progressData = this.mockDataService.getProgressData();
      this.progressGauges.forEach((gauge, i) => {
        if (progressData[i]) {
          gauge.setStack([{ percent: Math.min(100, progressData[i].value) }]);
        }
      });

      const clockDisplay = this.mockDataService.generateClockDisplay();
      this.clockText.setContent(
        `{bold}{red-fg}${clockDisplay.substring(0,2)}{/red-fg}:{yellow-fg}${clockDisplay.substring(3,5)}{/yellow-fg}:{green-fg}${clockDisplay.substring(6,8)}{/green-fg}{/bold}`
      );

      let cpuUsage = 50;
      let memUsagePercent = 50;
      let totalMem = 16 * 1024 * 1024 * 1024;
      let usedMem = 8 * 1024 * 1024 * 1024;
      let cpuCores = 4;
      let cpuSpeed = 3.5;
      const server = this.servers[this.currentServerIndex];
      
      if (this.config.dashboard.mockMode) {
        const mockCpu = 30 + Math.random() * 40;
        const mockMem = 40 + Math.random() * 30;
        cpuUsage = mockCpu;
        memUsagePercent = mockMem;
        usedMem = totalMem * (memUsagePercent / 100);
      } else if (server.local || server.host === 'localhost') {
        try {
          const metrics = await this.localService.getMetrics();
          cpuUsage = metrics.cpu.usage;
          memUsagePercent = metrics.memory.usedPercent;
          totalMem = metrics.memory.total;
          usedMem = metrics.memory.used;
          cpuCores = metrics.cpu.cores;
          cpuSpeed = metrics.cpu.speed;
          this.remoteMetrics.set('localhost', metrics);
        } catch (error) {
          console.log(chalk.yellow(`Local metrics error: ${error}`));
        }
      } else {
        try {
          if (this.sshService.isConnected(server.host)) {
            const metrics = await this.sshService.getRemoteMetrics(server);
            cpuUsage = metrics.cpu.usage;
            memUsagePercent = metrics.memory.usedPercent;
            totalMem = metrics.memory.total;
            usedMem = metrics.memory.used;
            this.remoteMetrics.set(server.host, metrics);
          }
        } catch (error) {
          console.log(chalk.red(`Error fetching metrics from ${server.name}: ${error}`));
        }
      }

      const cpuHistory = this.systemService.updateCpuHistory(cpuUsage);
      const memHistory = this.systemService.updateMemHistory(memUsagePercent);

      this.cpuWidget.update({ usage: cpuUsage, cores: cpuCores, speed: cpuSpeed }, cpuHistory);
      this.memWidget.update({ 
        total: totalMem, 
        used: usedMem,
        free: totalMem - usedMem,
        usedPercent: memUsagePercent
      }, memHistory);

      if (cpuHistory.length > 0) {
        const paddedCpuHistory = this.padArray(cpuHistory, 40, 0);
        this.cpuSparkline.setData(['CPU'], [paddedCpuHistory]);
      }

      if (memHistory.length > 0) {
        const paddedMemHistory = this.padArray(memHistory, 40, 0);
        this.memSparkline.setData(['MEM'], [paddedMemHistory]);
      }

      const mongoStatus = this.mockDataService.updateMongoStatus();
      this.mongoWidget.update(mongoStatus);

      const mongoData = this.mongoWidget.getCategoryData();
      const maxMongoVal = Math.max(...mongoData.map(d => d.value), 1);
      this.mongoGauges.forEach((gauge, i) => {
        if (mongoData[i]) {
          gauge.setStack([{ percent: Math.min(100, (mongoData[i].value / maxMongoVal) * 100), label: mongoData[i].value.toString() }]);
        }
      });

      const kafkaTopics = this.mockDataService.generateKafkaTopics();
      this.kafkaWidget.update(kafkaTopics);
      const kafkaData = this.kafkaWidget.getChartData();
      if (kafkaData[0].y.length > 0) {
        this.lineChartKafka.setData(kafkaData[0], kafkaData[1], kafkaData[2]);
      }

      const containers = await this.dockerService.getContainerStats();
      this.dockerWidget.update(containers);

      this.dockerTable.setData({
        headers: ['NAME', 'CPU%', 'MEM', 'PIDS'],
        data: this.dockerWidget.getTableData()
      });

      const memInfo = this.memWidget.getMemInfo();
      const cpuInfo = this.cpuWidget.getCpuInfo();
      const currentMetrics = this.remoteMetrics.get(server.host) || this.remoteMetrics.get('localhost');
      
      let statusContent = `{bold}RAM{/bold}: ${memInfo.used}/${memInfo.total}\n`;
      statusContent += `{bold}CPU{/bold}: ${cpuInfo.cores}c @ ${cpuInfo.speed}GHz\n`;
      statusContent += `{bold}Containers{/bold}: ${this.dockerWidget.getStatusSummary().running}/${this.dockerWidget.getStatusSummary().total}\n`;
      statusContent += `{bold}Server{/bold}: ${server.name}\n`;
      statusContent += `{bold}Time{/bold}: ${timestamp}`;
      
      if (currentMetrics?.loadAvg) {
        statusContent += `\n{bold}Load{/bold}: ${currentMetrics.loadAvg.map(l => l.toFixed(2)).join(', ')}`;
      }

      this.statusBar.setContent(statusContent);

    } catch (error) {
      console.error('Update error:', error);
    }
  }

  private padArray(arr: number[], size: number, fill: number): number[] {
    if (arr.length >= size) {
      return arr.slice(-size);
    }
    const result = new Array(size - arr.length).fill(fill);
    return [...result, ...arr];
  }

  public start(): void {
    this.update();
    this.refreshInterval = setInterval(() => this.update(), this.config.dashboard.refreshInterval);
    this.screen.render();
  }

  public stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.sshService.disconnect();
  }
}

function main(): void {
  console.clear();
  console.log(chalk.blue.bold('\n Starting Server Dashboard...\n'));
  console.log(chalk.gray(' Press [Q] to quit | [R] to refresh | [1-9] or [←/→] to switch server\n'));

  const dashboard = new Dashboard();
  dashboard.start();

  process.on('SIGINT', () => {
    dashboard.stop();
    process.exit(0);
  });
}

main();
