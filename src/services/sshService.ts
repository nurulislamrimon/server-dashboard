import { Client } from 'ssh2';
import * as si from 'systeminformation';
import { ServerConfig, RemoteMetrics } from '../types/server';

export class SSHService {
  private connections: Map<string, Client> = new Map();

  async connect(config: ServerConfig): Promise<Client> {
    return new Promise((resolve, reject) => {
      const client = new Client();
      
      const connectionConfig: any = {
        host: config.host,
        port: config.port,
        username: config.username
      };

      if (config.privateKey) {
        connectionConfig.privateKey = config.privateKey;
        if (config.passphrase) {
          connectionConfig.passphrase = config.passphrase;
        }
      } else if (config.password) {
        connectionConfig.password = config.password;
      }

      client.on('ready', () => {
        this.connections.set(config.host, client);
        resolve(client);
      });

      client.on('error', (err) => {
        reject(err);
      });

      client.connect(connectionConfig);
    });
  }

  async executeCommand(client: Client, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let output = '';
        let errorOutput = '';

        stream.on('close', () => {
          if (errorOutput) {
            reject(new Error(errorOutput));
          } else {
            resolve(output);
          }
        });

        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });
      });
    });
  }

  async getRemoteMetrics(config: ServerConfig): Promise<RemoteMetrics> {
    let client: Client | null = null;
    
    try {
      if (!this.connections.has(config.host)) {
        client = await this.connect(config);
      } else {
        client = this.connections.get(config.host)!;
      }

      const command = `echo '{"cpu":'$(cat /proc/stat | head -1 | awk '{print ($2+$3+$4+$5+$6+$7+$8)/($2+$3+$4+$5+$6+$7+$8-$5)*100}')'}'
echo '{"mem":'$(free | grep Mem | awk '{print $3","$2","$4","($3/$2)*100}')'}'
echo '{"uptime":'$(cat /proc/uptime | awk '{print $1}')'}'
echo '{"load":'$(cat /proc/loadavg | awk '{print $1","$2","$3}')'}'
echo '{"hostname":"'$(hostname)'"}'`;

      const output = await this.executeCommand(client, command);
      const lines = output.trim().split('\n');

      const cpu = JSON.parse(lines[0]);
      const memParts = lines[1].replace('{"mem":', '').replace('}', '').split(',');
      const uptime = parseFloat(lines[2].replace('{"uptime":', '').replace('}', ''));
      const loadParts = lines[3].replace('{"load":', '').replace('}', '').split(',');
      const hostname = lines[4].replace('{"hostname":"', '').replace('"}', '');

      return {
        hostname,
        cpu: { usage: parseFloat(cpu.cpu.toFixed(2)), cores: 0, speed: 0 },
        memory: {
          total: parseInt(memParts[1]) * 1024,
          used: parseInt(memParts[0]) * 1024,
          free: parseInt(memParts[2]) * 1024,
          usedPercent: parseFloat(memParts[3])
        },
        uptime,
        loadAvg: [parseFloat(loadParts[0]), parseFloat(loadParts[1]), parseFloat(loadParts[2])],
        timestamp: Date.now()
      };
    } catch (error) {
      throw error;
    }
  }

  disconnect(host?: string): void {
    if (host) {
      const client = this.connections.get(host);
      if (client) {
        client.end();
        this.connections.delete(host);
      }
    } else {
      this.connections.forEach((client) => client.end());
      this.connections.clear();
    }
  }

  isConnected(host: string): boolean {
    return this.connections.has(host);
  }
}

export class LocalSystemService {
  async getMetrics(): Promise<RemoteMetrics> {
    const [load, cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.cpu(),
      si.mem()
    ]);

    return {
      hostname: require('os').hostname(),
      cpu: {
        usage: load.currentLoad,
        cores: cpu.cores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: (mem.used / mem.total) * 100
      },
      uptime: si.time().uptime,
      loadAvg: require('os').loadavg(),
      timestamp: Date.now()
    };
  }
}
