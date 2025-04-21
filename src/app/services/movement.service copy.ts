import { Injectable } from '@angular/core';
import { BluetoothService, iBeacon } from './bluetooth.service';
import { DBSchema, IDBPDatabase, openDB } from 'idb';

function containsAll(arr1: any[], arr2: any[]): boolean {
  return arr2.every((element) => arr1.includes(element));
}
export interface iMovementSample {
  id?: number;
  name: string;
  beacon: any;
  position: [number, number];
  timestamp: number;
  rssi: number;
  project: string;
}
interface MovementSampleDB extends DBSchema {
  samples: {
    key: number;
    value: iMovementSample;
  };
}

const BLUETOOTH_MOVEMENT_STORE = 'BleMovementTriangulationSampleDB';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  constructor(private bluetoothService: BluetoothService) {
    this.initDB();
    console.log('moves', this);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  DATABASE                                  */
  /* -------------------------------------------------------------------------- */
  private movementDetectionSampleDb!: IDBPDatabase<any>;

  async initDB() {
    this.movementDetectionSampleDb = await openDB<MovementSampleDB>(
      BLUETOOTH_MOVEMENT_STORE,
      1,
      {
        upgrade(db) {
          db.createObjectStore('samples', {
            keyPath: 'id',
            autoIncrement: true,
          });
        },
      }
    );
  }
  /* -------------------------------------------------------------------------- */
  /*                               DATA COLLECTION                              */
  /* -------------------------------------------------------------------------- */
  selectedBeaconMacIds: string[] = [];
  selectedBeacons: any = {};

  /* Start scanning based on the selected beacons */
  beaconUpdateInterval: any;
  sample: any = {
    label: 1, // Label representing movement (e.g., 1 for movement, 0 for no movement)
    sequence: {
      'beacon-0': [-72, -73, -74, -65, -68],
      'beacon-1': [-60, -61, -59, -85, -60],
      'beacon-2': [-81, -80, -82, -90, -85],
    },
    timestamp: Date.now(), // T
  };
  async startCollecting() {
    this.selectedBeaconMacIds =
      this.bluetoothService.getTriangulationBeaconMacsIds();
    this.selectedBeacons = this.bluetoothService.getTriangulationBeaconMap();
    const { unsubscribeBluetoothBeaconScanner } =
      await this.bluetoothService.searchForBeacons();
    this.stopCollecting = () => {
      clearInterval(this.beaconUpdateInterval);
      unsubscribeBluetoothBeaconScanner();
    };

    this.beaconUpdateInterval = setInterval(() => {
      const scan = this.bluetoothService.getCurrentBeacons();
      const keys = Object.keys(scan);
      if (containsAll(keys, this.selectedBeaconMacIds)) {
        for (let i = 0; i < this.selectedBeaconMacIds.length; i++) {
          this.sample.sequence['beacon-' + i].push(
            scan[this.selectedBeaconMacIds[i]].rssi
          );
        }
        if (this.sample.sequence['beacon-0'].length == 5) {
          this.saveSample;
        }
      }

      console.log({ scan });
    }, 1000);
  }

  /* Stop scanning */
  stopCollecting() {}

  /* Handle RSSI data from scan */
  private onScanResult(result: any) {
    const mac = result.device.deviceId;
    const rssi = result.rssi;

    if (this.selectedBeaconMacIds.includes(mac)) {
      // Save the beacon's RSSI data to IndexedDB
      const beacon = this.selectedBeacons[mac];
      const beaconData = {
        name: result.device.name,
        beacon: beacon.beacon,
        position: beacon.position,
        timestamp: Date.now(),
        rssi: rssi,
        project: 'movement-detection',
      };
      /*       this.bluetoothService.saveBeacon(beaconData); */
    }
  }

  /* Flush buffer periodically */
  private onFlushBuffer() {
    console.log('Flushing buffer...');
  }

  /* Save the sample with the label */
  saveSample() {
    /*  const rssiData = this.getRSSIData();
    const sample = { label, sequence: rssiData };

    // Save sample to local storage or IndexedDB
    const saved = JSON.parse(localStorage.getItem('trainingSamples') || '[]');
    saved.push(sample);
    localStorage.setItem('trainingSamples', JSON.stringify(saved));

    this.clearBuffer();
    alert(`✅ Sample saved (label=${label})`); */
  }

  /* Get the current RSSI data from the beacons */
  getRSSIData() {
    /*   let rssiData = {};
    this.bluetoothService.getCurrentBeacons()["forEach"]((beacon, id) => {
      rssiData[id] = beacon.rssi;
    });
    return rssiData; */
  }

  /* Clear the buffer (stop tracking the beacons) */
  clearBuffer() {
    this.bluetoothService.setTriangulationBeacons([]);
  }
}

/**
 * ML 
 * 
{
  "label": 1,
  "sequence": {
    "beacon-1": [-72, -73, -74, -65, -68, ...],
    "beacon-2": [-60, -61, -59, -85, -60, ...],
    "beacon-3": [-81, -80, -82, -90, -85, ...]
  }
}
 */
