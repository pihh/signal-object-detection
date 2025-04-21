import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor() {}

  // Dummy prediction function. Replace with your actual prediction logic
  async predict(rssiMap: Record<string, number>): Promise<string> {
    // This is a dummy example; you need to replace it with a real prediction model.
    // For example, use machine learning models (TensorFlow.js or something similar).

    let predictedLabel = 'empty'; // Default label

    // Example logic: If RSSI is higher than a threshold, predict 'person_close'
    if (rssiMap && Object.values(rssiMap).some(rssi => rssi > -50)) {
      predictedLabel = 'person_close';
    }

    return predictedLabel;
  }
}
