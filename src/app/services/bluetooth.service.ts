import { Injectable } from '@angular/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface iBeacon {
  id?: number;
  name: string;
  beacon: any;
  position: [number, number];
  timestamp: number;
  rssi: number;
  project: string;
}
interface BeaconDB extends DBSchema {
  samples: {
    key: number;
    value: iBeacon;
  };
}

const BLUETOOTH_BEACON_STORE = 'BleBeaconDb';
const BLUETOOTH_BEACON_TRIANGULATION_STORE = 'BleTriangulationBeaconDb';
@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  constructor() {
    this.initDB();
  }

  /* -------------------------------------------------------------------------- */
  /*                                  DATABASE                                  */
  /* -------------------------------------------------------------------------- */
  private db!: IDBPDatabase<BeaconDB>;

  async initDB() {
    this.db = await openDB<BeaconDB>(BLUETOOTH_BEACON_STORE, 1, {
      upgrade(db) {
        db.createObjectStore('samples', {
          keyPath: 'id',
          autoIncrement: true,
        });
      },
    });
  }

  async saveBeacon(sample: Omit<BeaconDB['samples']['value'], 'id'>) {
    await this.db.add('samples', sample);
  }

  async getAllBeacons() {
    return await this.db.getAll('samples');
  }

  async clearBeacons() {
    await this.db.clear('samples');
  }

  setTriangulationBeacons(beacons: iBeacon[] = []) {
    localStorage.setItem(
      BLUETOOTH_BEACON_TRIANGULATION_STORE,
      JSON.stringify(beacons)
    );
  }

  getTriangulationBeacons() {
    return JSON.parse(
      localStorage.getItem(BLUETOOTH_BEACON_TRIANGULATION_STORE) || '[]'
    );
  }
  getTriangulationBeaconMap() {
    const beacons = this.getTriangulationBeacons();
    const beaconMap: any = {};
    for (let beacon of beacons) {
      beaconMap[beacon.id] = beacon;
    }

    return beaconMap;
  }
  getTriangulationBeaconMacsIds() {
    const beacons = this.getTriangulationBeacons();
    const ids = beacons.map((beacon: iBeacon) => beacon.id);
    ids.sort();
    return ids;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   BEACONS                                  */
  /* -------------------------------------------------------------------------- */
  beaconMap = new Map<string, any>();

  async searchForBeacons() {
    await BluetoothLe.initialize();

    await BluetoothLe.requestLEScan({
      allowDuplicates: true,
    });

    const scanListener: any = BluetoothLe.addListener(
      'onScanResult',
      (result: any = {}) => {
        if (result.device && result.rssi) {
          this.beaconMap.set(result.device.deviceId, {
            name: result.device.name || result.localName,
            rssi: result.rssi,
            txPower: result.txPower || 127,
          });
        }
      }
    );

    const unsubscribeBluetoothBeaconScanner = () => {
      scanListener.remove();
    };
    return { unsubscribeBluetoothBeaconScanner };
  }

  getCurrentBeacons(): Record<string, any> {
    return Object.fromEntries(this.beaconMap.entries());
  }

  /* -------------------------------------------------------------------------- */
  /*                                   SCANNER                                  */
  /* -------------------------------------------------------------------------- */
  async startScanning(
    onScanResult: any,
    onFlushBuffer: any = () => {},
    config: any = {}
  ) {
    config = {
      frequency: 3000,
      ...config,
    };
    try {
      await BluetoothLe.initialize();
    } catch (ex) {
      console.warn(ex);
    }

    await BluetoothLe.requestLEScan({ services: [], allowDuplicates: true });
    const scanListener: any = BluetoothLe.addListener(
      'onScanResult',
      onScanResult
    );
    const flushBuffer = () => {
      if (onFlushBuffer) {
        onFlushBuffer();
      }
    };

    // Periodically flush the buffer and draw heatmap
    const interval = setInterval(() => {
      flushBuffer();
    }, config.frequency);

    const unsubscribeBluetoothScanner = () => {
      scanListener.remove();
      clearInterval(interval);
    };
    return {
      scanListener,
      unsubscribeBluetoothScanner,
    };
  }
}
