import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CameraService } from 'src/app/services/camera.service';

@Component({
  selector: 'app-floor-map',
  templateUrl: './floor-map.component.html',
  styleUrls: ['./floor-map.component.scss'],
  standalone: false,
})
export class FloorMapComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  constructor(private cameraService: CameraService) {}

  async ngAfterViewInit() {
    const { videoElement, unsubscribeCameraRecorder } =
      await this.cameraService.startRecording(this.videoElement.nativeElement);

    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  marker: { x: number; y: number } | null = null;
  handleClick(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Get canvas bounds on screen
    const rect = canvas.getBoundingClientRect();

    // Account for scaling between layout size and canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Corrected click coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Save normalized marker (0 to 1 range)
    this.marker = {
      x: x / canvas.width,
      y: y / canvas.height,
    };

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional: draw background image here if needed

    // Draw red dot marker
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  ngOnInit() {}
}
