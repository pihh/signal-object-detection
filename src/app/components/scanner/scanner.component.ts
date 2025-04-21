import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { CameraService } from 'src/app/services/camera.service';
import { DataStorageService } from 'src/app/services/data-storage.service'; // Assuming you're using DataStorageService
import { HeatmapService } from 'src/app/services/heatmap.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss'],
  standalone: false,
})
export class ScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('heatmapCanvas') heatmapCanvas!: ElementRef<HTMLCanvasElement>;
  labels = [
    'empty',
    'person_close',
    'person_far',
    'wall',
    'multiple',
    'wall_then_person_close',
    'person_then_wall_close',
    'wall_then_person_far',
    'person_then_wall_far',
  ];
  currentLabel = 'empty'; // This can be dynamically changed via UI
  collecting = false;
  private ctx!: CanvasRenderingContext2D;
  private scanBuffer: Record<string, number[]> = {};
  private scanListener: any;

  private unsubscribeHeatmap: any;
  private forceRenderHeatmap: any;

  constructor(
    private ngZone: NgZone,
    private dataStorageService: DataStorageService,
    private cameraService: CameraService,
    private heatmapService: HeatmapService
  ) {}

  async ngAfterViewInit() {
    const { videoElement, unsubscribeCameraRecorder } =
      await this.cameraService.startRecording(this.videoElement.nativeElement);
    const { ctx, canvas, unsubscribeHeatmap, forceRenderHeatmap } =
      this.heatmapService.createCanvas(this.heatmapCanvas);
    this.ctx = ctx;
    this.unsubscribeHeatmap = unsubscribeHeatmap;
    this.forceRenderHeatmap = forceRenderHeatmap;

    /* this.canvas = canvas */
    /*     await this.initCamera();
    this.ctx = this.heatmapCanvas.nativeElement.getContext('2d')!;
    this.forceRenderHeatmap();
    window.addEventListener('resize', () => this.forceRenderHeatmap());
    const canvas = this.heatmapCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.forceRenderHeatmap();

    window.addEventListener('resize', () => this.forceRenderHeatmap()); */
  }

  ngOnDestroy(): void {
    this.unsubscribeHeatmap();
  }
  /* 
  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      console.error('Camera access error:', err);
    }
  } */

  /*   private forceRenderHeatmap() {
    const canvas = this.heatmapCanvas.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  } */

  // Start collecting RSSI values from Bluetooth
  async startCollecting() {
    try {
      await BluetoothLe.initialize();
    } catch (ex) {
      console.warn(ex);
    }

    /*     const canvas = this.heatmapCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!; */
    this.forceRenderHeatmap();

    this.collecting = true;
    this.scanBuffer = {};

    await BluetoothLe.requestLEScan({ services: [], allowDuplicates: true });
    this.scanListener = BluetoothLe.addListener(
      'onScanResult',
      ({ rssi, device, txPower, manufacturerData, serviceData }) => {
        if (!this.collecting || typeof rssi !== 'number') return;

        this.ngZone.run(() => {
          const id = device.deviceId || 'unknown';
          if (!this.scanBuffer[id]) this.scanBuffer[id] = [];
          this.scanBuffer[id].push(rssi);

          // Extract additional features
          txPower = txPower || 127; // Default value for unavailable TX power
          const deviceName = device.name || 'unknown';
          const manufacturerId = manufacturerData
            ? Object.keys(manufacturerData)[0]
            : 'unknown';
          const serviceUUIDs = serviceData ? Object.keys(serviceData) : [];
          const uuids = device.uuids || [];

          // Optionally: Calculate moving average of RSSI
          const rssiMovingAvg =
            this.scanBuffer[id].slice(-5).reduce((acc, val) => acc + val, 0) /
            5;

          // Store the data
          const sample = {
            label: this.currentLabel,
            timestamp: Date.now(),
            rssi,
            deviceId: id,
            deviceName,
            txPower,
            manufacturerId,
            serviceUUIDs,
            uuids,
            rssiMovingAvg,
            readings: {
              [id]: rssi,
            },
          };

          // Store this sample in the database (DataStorageService)
          this.dataStorageService.storeSample(sample);
        });
      }
    );

    // Periodically flush the buffer and draw heatmap
    setInterval(() => {
      if (this.collecting) this.flushBuffer();
    }, 3000);
  }

  // Stop collecting RSSI values
  stopCollecting() {
    // CameraPreview.stop()
    // this.collecting = false;
    this.scanListener?.remove();
    this.flushBuffer();
  }

  // Process the buffered data
  private flushBuffer() {
    const averagedReadings: Record<string, number> = {};
    Object.keys(this.scanBuffer).forEach((id) => {
      const readings = this.scanBuffer[id];
      if (readings.length > 0) {
        const avg = readings.reduce((a, b) => a + b) / readings.length;
        averagedReadings[id] = avg;
      }
    });

    this.heatmapService.drawHeatmapFromRssiMap(
      this.ctx,
      this.heatmapCanvas,
      averagedReadings
    );
    this.scanBuffer = {};
  }

  /*   // Draw the heatmap based on RSSI values
  drawHeatmapFromRssiMap(rssiMap: Record<string, number>) {
    const canvas = this.heatmapCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const ids = Object.keys(rssiMap);

    ids.forEach((id, i) => {
      const angle = (i / ids.length) * 2 * Math.PI;
      const x = width / 2 + Math.cos(angle) * 100;
      const y = height / 2 + Math.sin(angle) * 100;
      this.drawHeatBlob(x, y, rssiMap[id]);
    });
  }

  // Draw a heat blob (circle) on the canvas for each device
  drawHeatBlob(x: number, y: number, strength: number) {
    const ctx = this.ctx;
    const radius = 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const color = this.rssiToColor(strength);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Convert RSSI value to a color (heatmap effect)
  rssiToColor(rssi: number): string {
    const norm = Math.min(Math.max((rssi + 100) / 40, 0), 1);
    const red = Math.floor(255 * norm);
    const green = Math.floor(255 * (1 - norm));
    return `rgba(${red}, ${green}, 0, 0.4)`;
  } */
}
