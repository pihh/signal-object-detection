import { Injectable } from '@angular/core';
import localforage from 'localforage';

export interface RssiSample {
  label: string;
  timestamp: number;
  readings: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private memorySamples: RssiSample[] = [];

  constructor() {
    localforage.config({
      name: 'SignalSense',
      storeName: 'samples'
    });
  }

  async storeSample(sample: RssiSample) {
    this.memorySamples.push(sample);

    const key = `${sample.label}-${sample.timestamp}`;
    await localforage.setItem(key, sample);
    console.log('Stored sample in DB:', key);
  }

  async getAllSamples(): Promise<RssiSample[]> {
    const samples: RssiSample[] = [];
    await localforage.iterate((value: RssiSample) => {
      samples.push(value);
    });
    return samples;
  }

  async countLabels(): Promise<Record<string, number>> {
    const labelCounts: Record<string, number> = {};

    await localforage.iterate((value: RssiSample) => {
      const label = value.label || 'unknown';
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    console.log('Label counts:', labelCounts);
    return labelCounts;
  }

  async exportSamples(): Promise<string> {
    const samples = await this.getAllSamples();
    return JSON.stringify(samples, null, 2);
  }

  // Optional: clear all data
  async clear() {
    await localforage.clear();
    this.memorySamples = [];
    console.log('🧹 Cleared all stored samples');
  }
}