export interface DiagMetrics {
    activeChannels: number;
    activeIntervals: number;
    stateSizeKB: number;
    lastRenderReason: string;
}

type Listener = (metrics: DiagMetrics) => void;

class DiagnosticStoreClass {
    private metrics: DiagMetrics = {
        activeChannels: 0,
        activeIntervals: 0,
        stateSizeKB: 0,
        lastRenderReason: '',
    };
    private listeners: Set<Listener> = new Set();

    getMetrics(): DiagMetrics {
        return { ...this.metrics };
    }

    update(updates: Partial<DiagMetrics>) {
        this.metrics = { ...this.metrics, ...updates };
        this.notify();
    }

    incrementChannels() {
        this.metrics.activeChannels++;
        this.notify();
    }

    decrementChannels() {
        this.metrics.activeChannels = Math.max(0, this.metrics.activeChannels - 1);
        this.notify();
    }

    incrementIntervals() {
        this.metrics.activeIntervals++;
        this.notify();
    }

    decrementIntervals() {
        this.metrics.activeIntervals = Math.max(0, this.metrics.activeIntervals - 1);
        this.notify();
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        listener(this.metrics);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        const snapshot = { ...this.metrics };
        this.listeners.forEach(l => l(snapshot));
    }
}

export const DiagnosticStore = new DiagnosticStoreClass();
