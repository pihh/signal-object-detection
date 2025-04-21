import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private videoElements: any = {};

  constructor() {}

  async startRecording(videoElement) {
    let id = videoElement.id;
    if (!id) {
      id = uuidv4();
      videoElement.setAttribute('id', id);
    }
    if (!Object.prototype.hasOwnProperty.call(this.videoElements, id)) {
      this.videoElements[id] = videoElement;
    }
    await this.initCamera(videoElement);
    const unsubscribeCameraRecorder = () => {
      alert('todo');
    };
    return { videoElement, unsubscribeCameraRecorder };
  }

  private async initCamera(videoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      videoElement.srcObject = stream;
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }
}
