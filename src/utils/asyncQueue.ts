export class AsyncQueue {
    private concurrency: number;
    private queue: (() => Promise<void>)[];
    private running: number;
    private allTasks: Promise<void>[];

    constructor(concurrency: number) {
        this.concurrency = concurrency;
        this.queue = [];
        this.running = 0;
        this.allTasks = [];
    }
    enqueue<T>(task: () => Promise<T>): Promise<T> {
        const taskPromise = new Promise<T>((resolve, reject) => {
            this.queue.push(() => task().then(resolve).catch(reject));
            this.runNext();
        });

        this.allTasks.push(taskPromise.then(() => undefined).catch(() => undefined)); // Convert T to void and handle errors
        return taskPromise;
    }
    private runNext(): void {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }
        const task = this.queue.shift()!;
        this.running++;
        task().finally(() => {
            this.running--;
            this.runNext();
        });
    }
    onIdle(): Promise<void> {
        return Promise.all(this.allTasks).then(() => undefined);
    }
}
