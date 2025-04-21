import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { DataStorageService, LogEntry } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { MlModelService } from 'src/app/services/ml-model.service';


const GRID_CELLS = 9; // e.g. 3x3 grid

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements AfterViewInit{
  @ViewChild('heatmapCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cameraPreviewContainer', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  gridCells = Array(9).fill(0).map((_, i) => i);
  collecting = false;
  predicting = false;
  label = '';
  predictionLabel = '';

  private scanListener: any;
  private rssiSnapshot: { [id: string]: number } = {};

  constructor(
    private ngZone: NgZone,
    private dataStorage: DataStorageService,
    private mlService: MlModelService,
    private dataService:DataService
  ) {}

  async ngAfterViewInit() {
  }
  // async ngAfterViewInit() {
  //   const cameraConfig = {
  //     position: 'rear',
  //     parent: 'cameraPreviewContainer',
  //     className: 'camera-preview',
  //     width:document.body.offsetWidth,
  //     height:document.body.offsetWidth,
  //   }

  //   await CameraPreview.start(cameraConfig);

  //   await BluetoothLe.initialize();
  //   await this.startScan();
  // }

  // private async startScan() {
  //   await BluetoothLe.requestLEScan({ services: [], allowDuplicates: true });
  //   this.scanListener = BluetoothLe.addListener('onScanResult', (result: any) => {
  //     const rssi = result.rssi;
  //     const device = result.device;

  //     this.ngZone.run(() => {
  //       if (this.collecting && this.label && rssi !== undefined && device?.deviceId) {
  //         this.dataStorage.addEntry({
  //           label: this.label,
  //           timestamp: Date.now(),
  //           id: device.deviceId,
  //           rssi: rssi
  //         });
  //       }

  //       if (rssi !== undefined && device?.deviceId) {
  //         this.rssiSnapshot[device.deviceId] = rssi;
  //         if (this.predicting) this.predictLive();
  //         this.drawHeatmap(rssi);
  //       }
  //     });
  //   });
  // }

  toggleCollect() {
    this.collecting = !this.collecting;
  }

  toggleLivePredict() {
    this.predicting = !this.predicting;
  }

  async trainModel() {
    /*
    const entries = await this.dataStorage.getAllEntries();
    const allDeviceIds = Array.from(new Set(entries.map(e => e.id)));
    const grouped: { [key: string]: { [deviceId: string]: number[] } } = {};

    for (const entry of entries) {
      const sec = Math.floor(entry.timestamp / 1000);
      const key = `${entry.label}_${sec}`;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][entry.id]) grouped[key][entry.id] = [];
      grouped[key][entry.id].push(entry.rssi);
    }

    const samples = Object.entries(grouped).map(([key, devices]) => {
      const label = key.split('_')[0];
      const features = allDeviceIds.map(id => {
        const values = devices[id];
        if (values && values.length) {
          return values.reduce((a, b) => a + b, 0) / values.length;
        } else {
          return -100;
        }
      });
      return { features, label };
    });

    await this.mlService.trainModel(samples);
    */
  }

  async predictLive() {
    /*
    const allDeviceIds = Object.keys(this.rssiSnapshot);
    const allKnownIds = await this.dataStorage.getAllEntries().then(e => Array.from(new Set(e.map(x => x.id))));
    const featureVector = allKnownIds.map(id => this.rssiSnapshot[id] ?? -100);
    const prediction = await this.mlService.predict(featureVector);
    this.predictionLabel = prediction;
    */
  }

  async exportMLDataset() {
    /*
    const entries = await this.dataStorage.getAllEntries();

    const grouped: { [key: string]: { [deviceId: string]: number[] } } = {};

    for (const entry of entries) {
      const second = Math.floor(entry.timestamp / 1000);
      const key = `${entry.label}_${second}`;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][entry.id]) grouped[key][entry.id] = [];
      grouped[key][entry.id].push(entry.rssi);
    }

    const allDeviceIds = Array.from(new Set(entries.map(d => d.id)));

    const rows: string[] = [];
    const header = [...allDeviceIds.map(id => `rssi_${id}`), 'label'].join(',');
    rows.push(header);

    for (const [key, devices] of Object.entries(grouped)) {
      const parts = key.split('_');
      const label = parts.slice(0, -1).join('_');
      const row: string[] = [];
      for (const id of allDeviceIds) {
        const values = devices[id];
        if (values && values.length) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          row.push(avg.toFixed(2));
        } else {
          row.push('-100');
        }
      }
      row.push(label);
      rows.push(row.join(','));
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ml_dataset.csv';
    a.click();
    */
  }

  private drawHeatmap(rssi: number) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = this.containerRef.nativeElement.clientWidth;
    const height = this.containerRef.nativeElement.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const cellWidth = width / 3;
    const cellHeight = height / 3;

    const match = this.label.match(/cell-(\d+)/);
    if (!match) return;
    const index = parseInt(match[1]) - 1;
    const col = index % 3;
    const row = Math.floor(index / 3);

    const intensity = Math.min(Math.max((rssi + 100) / 100, 0), 1);
    const radius = intensity * Math.min(cellWidth, cellHeight) / 1.5;

    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;

    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(255,0,0,${intensity})`);
    grad.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
  }
}