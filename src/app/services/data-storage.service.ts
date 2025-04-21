import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

export interface LogEntry {
  label: string;
  timestamp: number;
  id: string;
  rssi: number;
}

const DB_NAME = 'BleHeatmapDB';
const STORE_NAME = 'entries';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
        }
      }
    });
  }

  // Add this method to store sample data
  async storeSample(sample: any): Promise<void> {
    const db = await this.dbPromise;
    // Store the sample in the database
    await db.put(STORE_NAME, sample);
    console.log('Stored sample in DataStorageService:', sample);
  }

  // Retrieve all entries from the database
  async getAllEntries(): Promise<LogEntry[]> {
    const db = await this.dbPromise;
    return await db.getAll(STORE_NAME);
  }

  // Clear all entries from the database
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }

  // Add the `countLabels` method
  async countLabels(): Promise<Record<string, number>> {
    const labelCounts: Record<string, number> = {};

    const entries = await this.getAllEntries();
    entries.forEach(entry => {
      const label = entry.label || 'unknown';
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    console.log('Label counts:', labelCounts);
    return labelCounts;
  }
}
