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
import { BluetoothService } from 'src/app/services/bluetooth.service';
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
    private heatmapService: HeatmapService,
    public bluetoothService: BluetoothService
  ) {}

  async ngAfterViewInit() {
    const { videoElement, unsubscribeCameraRecorder } =
      await this.cameraService.startRecording(this.videoElement.nativeElement);
    const { ctx, canvas, unsubscribeHeatmap, forceRenderHeatmap } =
      this.heatmapService.createCanvas(this.heatmapCanvas);
    this.ctx = ctx;
    this.unsubscribeHeatmap = unsubscribeHeatmap;
    this.forceRenderHeatmap = forceRenderHeatmap;
  }

  ngOnDestroy(): void {
    this.unsubscribeHeatmap();
    this.stopCollecting();
  }

  async startCollecting() {
    this.scanBuffer = {};

    const onScanResult = ({
      rssi,
      device,
      txPower,
      manufacturerData,
      serviceData,
    }) => {
      try {
        if (!this.collecting || typeof rssi !== 'number') return;

        this.ngZone.run(() => {
          try {
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
          } catch (ex) {
            console.warn(ex);
            debugger;
          }
        });
      } catch (ex) {
        console.warn(ex);
      }
    };
    const onFlushBuffer = () => {
      try {
        this.flushBuffer();
      } catch (ex) {
        console.warn(ex);
        debugger;
      }
    };

    this.forceRenderHeatmap();

    const { unsubscribeBluetoothScanner } =
      await this.bluetoothService.startScanning(onScanResult, onFlushBuffer);
    this.stopCollecting = unsubscribeBluetoothScanner;
  }
  // Start collecting RSSI values from Bluetooth
  /*   async startCollecting() {
    console.log('startCollectingV2');
    try {
      await BluetoothLe.initialize();
    } catch (ex) {
      console.warn(ex);
    }

    /*     const canvas = this.heatmapCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!; *
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
 */
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
}
