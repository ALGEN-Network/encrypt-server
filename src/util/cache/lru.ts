export class LRU<V> {
    private map: Map<number, V> = new Map();

    constructor(private capacity: number) {}

    get(key: number): V | null {
        if (!this.map.has(key)) {
            return null;
        }
        const value = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    put(key: number, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        }
        this.map.set(key, value);
        if (this.map.size > this.capacity) {
            this.map.delete(this.map.keys().next().value as number);
        }
    }

    isFull(): boolean {
        return this.map.size >= this.capacity;
    }
}
