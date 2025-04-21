import {
  Component,
  AfterViewInit,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { CameraService } from 'src/app/services/camera.service';
import { HeatmapService } from 'src/app/services/heatmap.service';
import { MlModelService } from 'src/app/services/ml-model.service';
@Component({
  selector: 'app-predict',
  templateUrl: './predict.component.html',
  styleUrls: ['./predict.component.scss'],
  standalone: false,
})
export class PredictComponent implements AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('heatmapCanvas') heatmapCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private collecting = false;
  private scanBuffer: Record<string, number[]> = {};
  private scanListener: any;
  predictionLabel: string = '';
  predictionConfidence: number = 0;
  predicting: boolean = false;

  // subscriptions

  private unsubscribeHeatmap: any;
  private forceRenderHeatmap: any;

  constructor(
    private mlModelService: MlModelService,
    private ngZone: NgZone,
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
  }

  /*   async initCamera() {
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

  /*   private resizeCanvas() {
    const canvas = this.heatmapCanvas.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  } */

  toggleLivePredict() {
    if (!this.predicting) {
      this.startPredicting();
    } else {
      this.stopPredicting();
    }
  }
  public async stopPredicting() {
    this.predicting = false;
    this.scanListener?.remove();
    this.flushAndPredict();
  }
  public async startPredicting() {
    try {
      await BluetoothLe.initialize();
    } catch (ex) {
      console.warn(ex);
    }
    this.predicting = true;
    /*   const canvas = this.heatmapCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.forceRenderHeatmap(); */

    this.collecting = true;
    this.scanBuffer = {};
    await BluetoothLe.requestLEScan({ services: [], allowDuplicates: true });

    this.scanListener = BluetoothLe.addListener(
      'onScanResult',
      ({ rssi, device }) => {
        if (!this.collecting || typeof rssi !== 'number') return;
        this.ngZone.run(() => {
          const id = device.deviceId || 'unknown';
          if (!this.scanBuffer[id]) this.scanBuffer[id] = [];
          this.scanBuffer[id].push(rssi);
        });
      }
    );

    setInterval(() => {
      if (this.collecting) this.flushAndPredict();
    }, 3000);
  }

  private async flushAndPredict() {
    const averagedReadings: Record<string, number> = {};
    Object.keys(this.scanBuffer).forEach((id) => {
      const readings = this.scanBuffer[id];
      if (readings.length > 0) {
        const avg = readings.reduce((a, b) => a + b) / readings.length;
        averagedReadings[id] = avg;
      }
    });

    const deviceIds = Object.keys(averagedReadings);
    const features = deviceIds.map((id) => averagedReadings[id]);

    try {
      const { label, confidence } = await this.mlModelService.predict(features);
      this.predictionLabel = label;
      this.predictionConfidence = confidence;
    } catch (err) {
      console.error('Prediction error:', err);
    }

    this.heatmapService.drawHeatmapFromRssiMap(
      this.ctx,
      this.heatmapCanvas,
      averagedReadings
    );
    this.scanBuffer = {};
  }
  /*   drawHeatmapFromRssiMap(rssiMap: Record<string, number>) {
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

  rssiToColor(rssi: number): string {
    const norm = Math.min(Math.max((rssi + 100) / 40, 0), 1);
    const red = Math.floor(255 * norm);
    const green = Math.floor(255 * (1 - norm));
    return `rgba(${red}, ${green}, 0, 0.4)`;
  } */
}
