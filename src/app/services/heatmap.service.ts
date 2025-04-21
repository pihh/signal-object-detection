import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeatmapService {
  constructor() {}

  public createCanvas(heatmapCanvasRef: any) {
    const canvas = heatmapCanvasRef.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d')!;

    this.resizeCanvas(heatmapCanvasRef);

    const resizeCallback = () => this.resizeCanvas(heatmapCanvasRef);

    const unsubscribeHeatmap = () => {
      window.removeEventListener('resize', resizeCallback);
    };

    window.addEventListener('resize', resizeCallback);

    return {
      ctx,
      canvas,
      unsubscribeHeatmap,
      forceRenderHeatmap: resizeCallback,
    };
  }

  private resizeCanvas(heatmapCanvasRef: any) {
    const canvas = heatmapCanvasRef.nativeElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  rssiToColor(rssi: number): string {
    const norm = Math.min(Math.max((rssi + 100) / 40, 0), 1);
    const red = Math.floor(255 * norm);
    const green = Math.floor(255 * (1 - norm));
    return `rgba(${red}, ${green}, 0, 0.4)`;
  }

  drawHeatBlob(ctx, x: number, y: number, strength: number) {
    //const ctx = this.ctx;
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

  drawHeatmapFromRssiMap(
    ctx: any,
    heatmapCanvasRef: any,
    rssiMap: Record<string, number>
  ) {
    const canvas = heatmapCanvasRef.nativeElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const ids = Object.keys(rssiMap);

    ids.forEach((id, i) => {
      const angle = (i / ids.length) * 2 * Math.PI;
      const x = width / 2 + Math.cos(angle) * 100;
      const y = height / 2 + Math.sin(angle) * 100;
      this.drawHeatBlob(ctx, x, y, rssiMap[id]);
    });
  }
}
