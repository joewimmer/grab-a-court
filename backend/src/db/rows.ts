import type { SQLOutputValue } from 'node:sqlite';

export function rowsAs<T>(result: Record<string, SQLOutputValue>[]): T[] {
  return result as unknown as T[];
}

export function rowAs<T>(result: Record<string, SQLOutputValue> | undefined): T | undefined {
  return result as unknown as T | undefined;
}
