import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface CacheRecord<T> {
  timestamp: number;
  payload: T;
}

export class FileCache {
  constructor(private readonly baseDir: string) {}

  private filePath(key: string): string {
    return path.join(this.baseDir, `${key}.json`);
  }

  async get<T>(key: string, ttlHours: number): Promise<T | null> {
    const filePath = this.filePath(key);
    try {
      const raw = await readFile(filePath, 'utf8');
      const data = JSON.parse(raw) as CacheRecord<T>;
      const ageMs = Date.now() - data.timestamp;
      if (ageMs > ttlHours * 60 * 60 * 1000) {
        return null;
      }
      return data.payload;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, payload: T): Promise<void> {
    await mkdir(this.baseDir, { recursive: true });
    const record: CacheRecord<T> = { timestamp: Date.now(), payload };
    await writeFile(this.filePath(key), JSON.stringify(record), 'utf8');
  }
}
