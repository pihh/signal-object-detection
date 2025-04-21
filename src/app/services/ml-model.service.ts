import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

// Custom Precision Metric
function precision(yTrue: tf.Tensor, yPred: tf.Tensor): tf.Tensor {
  const truePositive = tf.sum(tf.mul(yTrue, yPred));
  const predictedPositive = tf.sum(yPred);
  return tf.div(truePositive, predictedPositive.add(tf.scalar(1e-8)));
}

// Custom Recall Metric
function recall(yTrue: tf.Tensor, yPred: tf.Tensor): tf.Tensor {
  const truePositive = tf.sum(tf.mul(yTrue, yPred));
  const actualPositive = tf.sum(yTrue);
  return tf.div(truePositive, actualPositive.add(tf.scalar(1e-8)));
}

@Injectable({
  providedIn: 'root'
})
export class MlModelService {
  private model!: tf.LayersModel | any;
  private labelToIndex: { [key: string]: number } = {};
  private indexToLabel: string[] = [];
  public progress: any = 0;
  public accuracy: any = 0;
  public epochs: any = 0;
  
  async trainModel(data: any[]): Promise<void> {
    this.progress = 0;
    const labels = Array.from(new Set(data.map(d => d.label)));
    this.indexToLabel = labels;
    this.labelToIndex = labels.reduce((acc, label, idx) => ({ ...acc, [label]: idx }), {});

    // Create tensors for features (xs) and labels (ys)
    const xs = tf.tensor2d(data.map(d => d.features));
    const ys = tf.tensor1d(data.map(d => this.labelToIndex[d.label]), 'int32');
    const ysOneHot = tf.oneHot(ys, labels.length);

    if (this.model) {
      this.model.dispose(); // Clean up previous model
    }

    // Create a new model with added layers and more advanced techniques
    this.model = tf.sequential();
    
    // Input layer with Batch Normalization and LeakyReLU activation
    this.model.add(tf.layers.dense({ inputShape: [data[0].features.length], units: 64, activation: 'linear' }));
    this.model.add(tf.layers.batchNormalization());
    this.model.add(tf.layers.leakyReLU({ alpha: 0.1 }));
    
    // Hidden layers with Dropout for regularization
    this.model.add(tf.layers.dense({ units: 64, activation: 'linear' }));
    this.model.add(tf.layers.batchNormalization());
    this.model.add(tf.layers.leakyReLU({ alpha: 0.1 }));
    this.model.add(tf.layers.dropout({ rate: 0.5 }));

    // Output layer with Softmax for multi-class classification
    this.model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));

    // Compile the model with custom metrics (precision, recall) and adamax optimizer
    this.model.compile({
      optimizer: tf.train.adamax(0.002),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy', precision, recall],  // Adding custom metrics here
    });

    // Train the model with progress tracking
    const history = await this.model.fit(xs, ysOneHot, {
      epochs: 20,
      batchSize: 16,
      callbacks: [
        {
          onEpochEnd: (epoch, logs) => {
            const progress = Math.round((epoch + 1) / 20 * 100);
            console.log(`Epoch ${epoch + 1} - Accuracy: ${logs.acc.toFixed(4)} - Progress: ${progress}%`);
            this.progress = progress / 100;
            this.epochs = epoch + 1;
            this.accuracy = logs.acc.toFixed(4);
          },
        },
      ],
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
    ysOneHot.dispose();
  }

  // Update predict method to return confidence as well
  async predict(features: number[]): Promise<{ label: string; confidence: number }> {
    if (!this.model) throw new Error('Model not trained yet');
    
    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const data = await prediction.data(); // Probabilities

    // Get the index of the maximum probability (the predicted class)
    const index = data.indexOf(Math.max(...data));
    const label = this.indexToLabel[index];
    const confidence = data[index]; // Confidence is the predicted probability

    // Dispose of tensors to free memory
    input.dispose();
    prediction.dispose();

    return { label, confidence };
  }

  // Save model to IndexedDB
  saveModel(): Promise<void> {
    return this.model?.save('indexeddb://ble-heatmap-model');
  }

  // Load model from IndexedDB
  async loadModel(): Promise<void> {
    this.model = await tf.loadLayersModel('indexeddb://ble-heatmap-model');
    // Optionally update accuracy after loading the model if necessary
    const history = await this.getHistory();  // Load previous training data
    this.accuracy = history.accuracy; // Update with the last known accuracy
  }

  // Save model and metadata (labels, training history)
  async exportModelAndData() {
    const modelUrl = 'indexeddb://ble-heatmap-model';
    const modelMetadata = {
      labels: this.indexToLabel,
      accuracy: this.accuracy,
      epochs: this.epochs,
    };

    // Save model to IndexedDB (or use an alternative file-saving method)
    await this.model.save(modelUrl);
    
    // Save the metadata (labels, accuracy, epochs) to IndexedDB or to a file for Android
    localStorage.setItem('modelMetadata', JSON.stringify(modelMetadata));

    console.log("Model and metadata saved successfully.");
  }

  // Import model and metadata from storage
  async importModelAndData() {
    const modelMetadata = JSON.parse(localStorage.getItem('modelMetadata') || '{}');
    if (modelMetadata) {
      this.indexToLabel = modelMetadata.labels || [];
      this.accuracy = modelMetadata.accuracy;
      this.epochs = modelMetadata.epochs;
    }

    this.model = await tf.loadLayersModel('indexeddb://ble-heatmap-model');
  }
  
  // Optional: Helper to load training history (like accuracy)
  async getHistory() {
    // Retrieve history from local storage or from a database
    const history = JSON.parse(localStorage.getItem('trainingHistory') || '{}');
    return history;
  }
}