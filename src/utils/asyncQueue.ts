export class AsyncQueue {
    private queue: Array<() => Promise<any>> = [];
    private runningTasks: number = 0;
    private maxConcurrent: number;
    private idleCallbacks: Array<() => void> = [];

    constructor(maxConcurrent: number) {
        this.maxConcurrent = maxConcurrent;
    }

    private runNextTask(): void {
        if (this.runningTasks >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        if (!task) {
            return;
        }

        this.runningTasks++;
        task()
            .catch((err) => console.error('Task error:', err))
            .finally(() => this.onTaskComplete());
    }

    private onTaskComplete(): void {
        this.runningTasks--;

        if (this.queue.length === 0 && this.runningTasks === 0) {
            this.idleCallbacks.forEach((callback) => callback());
            this.idleCallbacks = [];
        } else {
            this.runNextTask();
        }
    }

    enqueue(task: () => Promise<any>): void {
        this.queue.push(task);
        this.runNextTask();
    }

    onIdle(callback: (...rest: any[]) => void): void {
        if (this.queue.length === 0 && this.runningTasks === 0) {
            callback();
        } else {
            this.idleCallbacks.push(callback);
        }
    }
}
