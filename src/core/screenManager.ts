import blessed from 'blessed';
import { DashboardConfig } from '../types';

export interface ScreenOptions {
  smartCSR: boolean;
  autoPadding: boolean;
  dockBorders: boolean;
}

export class ScreenManager {
  private screen: blessed.Widgets.Screen | null = null;
  private config: DashboardConfig;

  constructor(config: DashboardConfig) {
    this.config = config;
  }

  createScreen(): blessed.Widgets.Screen {
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      dockBorders: true,
      title: 'Server Dashboard - Real-time Monitoring',
      fullUnicode: true,
      ignoreDockContrast: true
    });

    return this.screen;
  }

  getScreen(): blessed.Widgets.Screen {
    if (!this.screen) {
      return this.createScreen();
    }
    return this.screen;
  }

  destroy(): void {
    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
    }
  }

  render(): void {
    if (this.screen) {
      this.screen.render();
    }
  }
}

export function createPanel(
  parent: blessed.Widgets.Node,
  options: {
    title: string;
    left: number;
    top: number;
    width: number;
    height: number;
    border?: string;
    borderFg?: string;
    bg?: string;
    labelFg?: string;
  }
): blessed.Widgets.BoxElement {
  return blessed.box({
    parent,
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    content: '',
    border: {
      type: 'line',
      fg: (options.borderFg || 'blue') as any
    },
    style: {
      bg: options.bg || 'black',
      border: {
        fg: (options.borderFg || 'blue') as any
      }
    },
    label: ` ${options.title} `,
    labelFg: (options.labelFg || 'white') as any
  });
}
