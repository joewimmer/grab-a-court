import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';

// Node 22's experimental web storage is not enabled under jsdom, so `localStorage`
// is undefined in tests. Provide a minimal in-memory implementation.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
