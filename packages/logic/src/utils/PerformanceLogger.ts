
export class PerformanceLogger {
    private static timers: Map<string, number> = new Map();
    private static lastInteraction: number = 0;

    static setLastInteraction() {
        this.lastInteraction = Date.now();
    }

    static getLastInteraction(): number {
        return this.lastInteraction;
    }

    static startTimer(id: string) {
        this.timers.set(id, Date.now());
    }

    static endTimer(id: string): number {
        const start = this.timers.get(id);
        if (!start) return 0;
        const duration = Date.now() - start;
        this.timers.delete(id);
        return duration;
    }

    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static logLatency(label: string, ms: number) {
        const color = ms > 500 ? '🔴' : ms > 200 ? '🟡' : '🟢';
        console.log(`${color} [LATENCIA] ${label}: ${ms}ms`);
    }

    static logMemory(label: string, bytes: number) {
        console.log(`🧠 [MEMORIA] ${label}: ${this.formatBytes(bytes)}`);
    }

    static monitorProcessMemory() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memory = process.memoryUsage();
            this.logMemory('Node JS Heap Used', memory.heapUsed);
            this.logMemory('Node JS RSS', memory.rss);
        }
    }
}
