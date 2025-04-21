// ml-model.service.ts
import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

export interface Sample {
  features: number[];
  label: string;
}

@Injectable({ providedIn: 'root' })
export class MlModelService {
  private model!: tf.LayersModel | any;
  private labelToIndex: { [key: string]: number } = {};
  private indexToLabel: string[] = [];

  async trainModel(data: Sample[]): Promise<void> {
    const labels = Array.from(new Set(data.map(d => d.label)));
    this.indexToLabel = labels;
    this.labelToIndex = labels.reduce((acc, label, idx) => ({ ...acc, [label]: idx }), {});

    const xs = tf.tensor2d(data.map(d => d.features));
    const ys = tf.tensor1d(data.map(d => this.labelToIndex[d.label]), 'int32');
    const ysOneHot = tf.oneHot(ys, labels.length);

    if (this.model) {
      this.model.dispose(); // clean up the previous model
    }
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ inputShape: [data[0].features.length], units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));

    this.model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    await this.model.fit(xs, ysOneHot, { epochs: 20, batchSize: 16 });

    xs.dispose();
    ys.dispose();
    ysOneHot.dispose();
  }

  async predict(features: number[]): Promise<{ label: string; confidence: number }> {
    if (!this.model) throw new Error('Model not trained yet');
    
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const data = await prediction.data(); // probabilities
  
    const index = data.indexOf(Math.max(...data));
    const label = this.indexToLabel[index];
    const confidence = data[index];
  
    input.dispose();
    prediction.dispose();
  
    return { label, confidence };
  }

  saveModel(): Promise<void> {
    return this.model?.save('indexeddb://ble-heatmap-model');
  }

  async loadModel(): Promise<void> {
    this.model = await tf.loadLayersModel('indexeddb://ble-heatmap-model');
  }
}
