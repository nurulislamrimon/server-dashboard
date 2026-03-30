import { ProgressData } from '../types';

export class ProgressClockWidget {
  private progressData: ProgressData[] = [];
  private clockDisplay: string = '00:00:00';
  private weather: { temp: number; condition: string } = { temp: 0, condition: '' };

  update(progressData: ProgressData[], clockDisplay: string, weather: { temp: number; condition: string }): void {
    this.progressData = progressData;
    this.clockDisplay = clockDisplay;
    this.weather = weather;
  }

  getProgressData(): ProgressData[] {
    return this.progressData;
  }

  getClockDisplay(): string {
    return this.clockDisplay;
  }

  getClockDigits(): string[] {
    return this.clockDisplay.split(':');
  }

  getWeather(): { temp: number; condition: string } {
    return this.weather;
  }

  formatAsciiClock(): string[] {
    const digits = this.clockDisplay.replace(/:/g, '');
    const digitArt = [
      '┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐',
      '│  │ │  │ │  │ │  │ │  │',
      '│  │ │  │ │  │ │  │ │  │',
      '└──┘ └──┘ └──┘ └──┘ └──┘',
      '│  │ │  │ │  │ │  │ │  │',
      '│  │ │  │ │  │ │  │ │  │',
      '└──┘ └──┘ └──┘ └──┘ └──┘'
    ];
    return digitArt;
  }
}
