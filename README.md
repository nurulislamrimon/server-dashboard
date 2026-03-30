# Server Dashboard

A production-ready CLI dashboard combining htop + Grafana aesthetics for real-time server monitoring.

## Features

- **Real-time Monitoring**: Auto-refreshing dashboard with 1-second intervals
- **Multi-panel Layout**: 12x12 grid with multiple widgets
- **System Metrics**: CPU usage, memory usage with sparkline history
- **Search Latency**: Line chart showing Google, Bing, Yahoo response times
- **Time Progress**: Visual gauges for year, day, hour, minute progress with digital clock
- **MongoDB Status**: Document counts by status (NEW, PROCESS, FAILED, COMPLETED)
- **Kafka Metrics**: In-flight messages tracking (INBOUND, PROCESSING, DLQ)
- **Docker Stats**: Container monitoring with CPU%, MEM, PIDS
- **Dark Theme**: Professional DevOps aesthetic
- **Multi-Server Support**: SSH connection to remote servers with server switching
- **Keyboard Controls**: q/Q to quit, r/R to refresh, number keys to switch servers

## Quick Start

```bash
npm install
npm run dev    # Development mode
npm start      # Production build
```

## Usage

```bash
npm start
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `q` or `Q` | Quit dashboard |
| `Ctrl+C` | Force quit |
| `r` or `R` | Manual refresh |
| `1-9` | Switch to server by number |
| `←` / `→` | Previous / Next server |

## Configuration

### servers.yml - Multi-Server Setup

Edit `servers.yml` to add remote servers:

```yaml
servers:
  # Local server (always included by default)
  - name: "local"
    host: "localhost"
    port: 22
    username: ""
    local: true

  # SSH server with password authentication
  - name: "production-web-01"
    host: "192.168.1.100"
    port: 22
    username: "admin"
    password: "your-password"

  # SSH server with private key authentication
  - name: "production-db-01"
    host: "192.168.1.101"
    port: 22
    username: "admin"
    privateKey: "/path/to/private/key"
    passphrase: "key-passphrase"  # optional

dashboard:
  refreshInterval: 1000    # milliseconds
  mockMode: false          # set true for mock data
  selectedServer: 0         # default server index
```

### config.yml - General Settings

```yaml
docker:
  enabled: true            # enable docker stats
  containerLimit: 10       # max containers to display

theme:
  borderColor: blue
  healthyColor: green
  warningColor: yellow
  criticalColor: red
```

## Architecture

```
src/
├── core/              # Screen and layout managers
├── widgets/           # Individual widget classes
├── services/          # Data providers
│   ├── systemService.ts      # Local system metrics
│   ├── dockerService.ts      # Docker stats
│   ├── mockDataService.ts    # Mock/seed data
│   └── sshService.ts         # SSH remote connections
├── config/            # Configuration loaders
├── types/             # TypeScript interfaces
└── index.ts           # Main application
```

## Widget Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Servers: [local] | server-1 | server-2                      │
├───────────────────────┬────────────────────────────────────┤
│  Search Response       │         12:34:56                    │
│     Time Chart         │   YEAR ████████░░ 85%               │
│   (Google/Bing/        │   DAY  ███░░░░░░░ 25%               │
│     Yahoo)            │   HOUR ██████████ 99%                │
│                       │   MIN  ██░░░░░░░░ 15%               │
├──────────┬─────────────┴──────────┬───────────────────────────┤
│  CPU     │  Memory   │  Mongo    │                           │
│  Spark   │  Spark    │  Status   │       Docker Table        │
│  line    │  line     │  Gauges   │                           │
├──────────┴─────────────┴───────────┴───────────────────────────┤
│     Kafka In-Flight Messages Chart        │   System Info    │
├─────────────────────────────────────────────┤   RAM: 8/16GB    │
│  [Q] Quit | [R] Refresh | [1-9] Server     │   CPU: 4c @ 3.5GHz│
└─────────────────────────────────────────────┴─────────────────┘
```

## Color Coding

- **Green**: Healthy status
- **Yellow**: Warning status
- **Red**: Critical status

## License

MIT
