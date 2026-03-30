import { WidgetBounds } from '../types';

export interface LayoutDefinition {
  id: string;
  bounds: WidgetBounds;
}

export const LAYOUT_GRID = {
  cols: 12,
  rows: 12
};

export const WIDGET_LAYOUTS: LayoutDefinition[] = [
  {
    id: 'searchChart',
    bounds: { left: 0, top: 0, width: 6, height: 6 }
  },
  {
    id: 'progressClock',
    bounds: { left: 6, top: 0, width: 6, height: 6 }
  },
  {
    id: 'cpuGraph',
    bounds: { left: 0, top: 6, width: 3, height: 3 }
  },
  {
    id: 'memGraph',
    bounds: { left: 3, top: 6, width: 3, height: 3 }
  },
  {
    id: 'mongoStats',
    bounds: { left: 6, top: 6, width: 3, height: 3 }
  },
  {
    id: 'kafkaTopics',
    bounds: { left: 9, top: 6, width: 3, height: 3 }
  },
  {
    id: 'dockerTable',
    bounds: { left: 0, top: 9, width: 9, height: 3 }
  },
  {
    id: 'weatherInfo',
    bounds: { left: 9, top: 9, width: 3, height: 3 }
  }
];

export class LayoutManager {
  private screenWidth: number;
  private screenHeight: number;
  private layouts: Map<string, WidgetBounds> = new Map();

  constructor(screenWidth: number = 180, screenHeight: number = 50) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.initializeLayouts();
  }

  private initializeLayouts(): void {
    WIDGET_LAYOUTS.forEach(layout => {
      this.layouts.set(layout.id, layout.bounds);
    });
  }

  getBounds(widgetId: string): WidgetBounds | undefined {
    return this.layouts.get(widgetId);
  }

  calculatePixelPosition(gridPos: { col: number; row: number }, span: { colSpan: number; rowSpan: number }): {
    left: number;
    top: number;
    width: number;
    height: number;
  } {
    const cellWidth = this.screenWidth / LAYOUT_GRID.cols;
    const cellHeight = this.screenHeight / LAYOUT_GRID.rows;

    return {
      left: Math.floor(gridPos.col * cellWidth),
      top: Math.floor(gridPos.row * cellHeight),
      width: Math.floor(span.colSpan * cellWidth) - 1,
      height: Math.floor(span.rowSpan * cellHeight) - 1
    };
  }

  recalculateForScreen(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.initializeLayouts();
  }
}
