import { MongoStatus } from '../types';

export class MongoWidget {
  private status: MongoStatus = {
    new: 0,
    inProcess: 0,
    failed: 0,
    completed: 0
  };

  update(status: MongoStatus): void {
    this.status = status;
  }

  getStatus(): MongoStatus {
    return this.status;
  }

  getTotal(): number {
    return this.status.new + this.status.inProcess + this.status.failed + this.status.completed;
  }

  getCategoryData(): { label: string; value: number; color: string }[] {
    return [
      { label: 'NEW', value: this.status.new, color: 'cyan' },
      { label: 'IN PROCESS', value: this.status.inProcess, color: 'yellow' },
      { label: 'FAILED', value: this.status.failed, color: 'red' },
      { label: 'COMPLETED', value: this.status.completed, color: 'green' }
    ];
  }

  getStatusColor(): string {
    const failRate = this.status.failed / this.getTotal();
    if (failRate < 0.01) return 'green';
    if (failRate < 0.05) return 'yellow';
    return 'red';
  }
}
