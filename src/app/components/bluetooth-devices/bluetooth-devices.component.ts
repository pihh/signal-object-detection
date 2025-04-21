import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BluetoothService } from '../../services/bluetooth.service';

@Component({
  selector: 'app-bluetooth-devices',
  templateUrl: './bluetooth-devices.component.html',
  styleUrls: ['./bluetooth-devices.component.scss'],
  standalone: false,
})
export class BluetoothDevicesComponent implements OnInit, OnDestroy {
  @Input('nBeacons') nBeacons: number = 3;

  xCoord = 0;
  yCoord = 0;
  scanEntries: { id: string; rssi: any; name: any }[] = [];
  selectedBeacon: any = {};
  selectedBeacons: any = [];
  testEntry: any = {
    id: '47:F6:01:5C:89:9F',
    name: 'Meta Quest 3S',
    rssi: -54,
    txPower: 127,
  };

  get selectedBeaconIds() {
    return this.selectedBeacons.map((b) => b.id);
  }
  get availableBeacons() {
    return this.scanEntries.filter(
      (b) => this.selectedBeaconIds.indexOf(b.id) == -1
    );
  }

  constructor(private bluetoothService: BluetoothService) {}

  async ngOnInit() {
    this.selectedBeacons = [...this.bluetoothService.getTriangulationBeacons()];
    const { unsubscribeBluetoothBeaconScanner } =
      await this.bluetoothService.searchForBeacons();

    this.stopSearching = unsubscribeBluetoothBeaconScanner;
    setInterval(() => {
      const scan = this.bluetoothService.getCurrentBeacons();

      this.scanEntries = Object.entries(scan).map(([id, entry]) => ({
        id,
        rssi: entry.rssi,
        name: entry.name,
      }));
    }, 1000);
  }

  stopSearching() {}
  ngOnDestroy(): void {
    this.stopSearching();
  }

  toggleListedBeacon(beacon: any) {
    if (this.selectedBeaconIds.indexOf(beacon.id) > -1) {
      this.selectedBeacons = [
        ...this.selectedBeacons.filter((b: any) => b.id !== beacon.id),
      ];
    } else {
      this.selectedBeacons = [...this.selectedBeacons, beacon];
    }
  }
  toggleSelectedBeacon(beacon: any) {
    if (this.selectedBeacon?.id == beacon.id) {
      this.selectedBeacon = {};
    } else {
      this.selectedBeacon = {
        ...beacon,
      };
    }
  }

  saveSample() {
    const data = {
      /*     beacons: this.bluetoothService.getCurrentBeacons(), */
      id: this.selectedBeacon.id,
      name: this.selectedBeacon.name,
      beacon: { ...this.selectedBeacon, x: this.xCoord, y: this.yCoord },
      position: [this.xCoord, this.yCoord],
      timestamp: Date.now(),
    };
    const index = this.selectedBeaconIds.indexOf(data.id);

    if (index == -1) {
      this.selectedBeacons = [...this.selectedBeacons, data];
    } else {
      this.selectedBeacons = [
        ...this.selectedBeacons.map((b: any) =>
          b.id === data.id
            ? {
                ...data,
                beacon: { ...data.beacon },
                position: [...data.position],
              }
            : b
        ),
      ];
    }
    console.log({
      index,
      selectedBeaconIds: this.selectedBeaconIds,
      availableBeacons: this.availableBeacons,
      selectedBeacon: this.selectedBeacon,
      selectedBeacons: this.selectedBeacons,
    });
    this.selectedBeacon = {};
  }

  onConfirmSelection() {
    localStorage.setItem(
      'BleTriangulationBeacons',
      JSON.stringify(this.selectedBeacons)
    );
    this.bluetoothService.setTriangulationBeacons(this.selectedBeacons);
  }
}
