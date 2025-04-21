import { Injectable } from '@angular/core';
import { BluetoothService } from './bluetooth.service';
import * as tf from '@tensorflow/tfjs';
import { openDB, IDBPDatabase, DBSchema } from 'idb';

interface MovementSampleDB extends DBSchema {
  samples: {
    key: number;
    value: any;
  };
}

const BLUETOOTH_MOVEMENT_STORE = 'movementSamplesDB';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private model: tf.LayersModel | null = null;
  private sequenceLength: number = 5; // Number of time-steps for LSTM
  private inputShape: number = 3; // Number of beacons (features)

  private db!: IDBPDatabase<MovementSampleDB>;
  private beaconUpdateInterval: any;
  private predictionInterval: any;

  selectedBeaconMacIds: string[] = [];
  sample: any = {
    label: -1,
    sequence: {},
    timestamp: Date.now(),
  };

  constructor(private bluetoothService: BluetoothService) {
    this.initDB();
  }

  // **Initialize IndexedDB**
  async initDB() {
    this.db = await openDB<MovementSampleDB>(BLUETOOTH_MOVEMENT_STORE, 1, {
      upgrade(db) {
        db.createObjectStore('samples', { keyPath: 'id', autoIncrement: true });
      },
    });
  }

  // **Collect Data from Beacons**
  async startCollecting(label: number = 0) {
    this.selectedBeaconMacIds =
      this.bluetoothService.getTriangulationBeaconMacsIds();
    this.resetSample(label);

    const { unsubscribeBluetoothBeaconScanner } =
      await this.bluetoothService.searchForBeacons();

    this.stopCollecting = () => {
      clearInterval(this.beaconUpdateInterval);
      unsubscribeBluetoothBeaconScanner();
    };

    // Collect RSSI data at intervals
    this.beaconUpdateInterval = setInterval(() => {
      this.getRSSIData(label);
    }, 100);
  }

  stopCollecting() {
    // Stop collecting data when needed
    clearInterval(this.beaconUpdateInterval);
  }

  // **Reset Sample (for each collection cycle)**
  public resetSample(label: number) {
    this.sample = {
      label: label,
      sequence: {},
      timestamp: Date.now(),
    };
    for (let id of this.selectedBeaconMacIds) {
      this.sample.sequence[id] = [];
    }
  }

  // **Collect RSSI data from Bluetooth service**
  private isTraining: boolean = false;
  async getRSSIData(label: number) {
    const scan = this.bluetoothService.getCurrentBeacons();
    const keys = Object.keys(scan);

    if (this.containsAll(keys, this.selectedBeaconMacIds)) {
      for (let i = 0; i < this.selectedBeaconMacIds.length; i++) {
        this.sample.sequence[this.selectedBeaconMacIds[i]].push(
          scan[this.selectedBeaconMacIds[i]].rssi
        );
      }

      // When we have enough data points, save and possibly train the model
      if (
        this.sample.sequence[this.selectedBeaconMacIds[0]].length ===
        this.sequenceLength
      ) {
        this.saveSample(label);
        if (!this.isTraining && (await this.shouldTrainModel())) {
          this.isTraining = true;
          await this.trainModel();
          this.isTraining = false;
        }
      }
    }
  }

  // **Check if enough samples are available for training**
  async shouldTrainModel() {
    return this.db.count('samples').then((count) => count > 50); // Train after 50 samples
  }

  // **Save Sample to IndexedDB**
  async saveSample(label: number) {
    const sample = this.sample;
    await this.db.add('samples', sample); // Save the sample in IndexedDB
    this.resetSample(label);
  }

  // **Preparing Data for Training**
  prepareTrainingData(samples: any[]) {
    const data: number[][][] = [];
    const labels: number[] = [];

    for (const sample of samples) {
      const rawSequence: any = Object.values(sample.sequence); // [beacon1[], beacon2[], beacon3[]]
      const sequenceLength = rawSequence[0].length;

      // Transpose from [3][5] to [5][3]
      const transposed: number[][] = [];

      for (let t = 0; t < sequenceLength; t++) {
        const timestep: number[] = [];
        for (let b = 0; b < rawSequence.length; b++) {
          timestep.push(rawSequence[b][t]);
        }
        transposed.push(timestep); // shape [5][3]
      }

      data.push(transposed);
      labels.push(sample.label);
    }

    return { data, labels };
  }
  // **Training the Model**
  async trainModel() {
    const samples = await this.db.getAll('samples');
    const { data, labels } = this.prepareTrainingData(samples);

    // Convert to TensorFlow tensors
    const inputTensor = tf.tensor(data); // (num_samples, time_steps, features)
    const outputTensor = tf.tensor(labels); // (num_samples, 1)

    // Build and train the LSTM model
    const model = this.buildModel();
    await model.fit(inputTensor, outputTensor, {
      epochs: 10,
      batchSize: 16,
    });

    // Save the trained model to localStorage
    await model.save('localstorage://movement-model');
    console.log('Model trained and saved!');
    this.model = model;
  }

  // **Building the LSTM model**
  buildModel() {
    const model = tf.sequential();
    model.add(
      tf.layers.lstm({
        units: 50,
        inputShape: [this.sequenceLength, this.inputShape],
        returnSequences: false,
      })
    );
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    return model;
  }

  // **Prediction based on Beacon RSSI data**
  async predictMovement() {
    if (!this.model) {
      console.warn('Model is not loaded yet.');
      throw 'Not loaded';
    }

    // Prepare the input data from beacon RSSI
    const sequenceData = this.prepareSequenceDataFromBeacons();

    if (sequenceData.length === 0) {
      console.warn('No valid beacon data available for prediction.');
      return false;
    }

    // Convert the data to TensorFlow tensor format
    const inputData = tf.tensor([sequenceData]);

    // Make prediction
    const prediction = this.model.predict(inputData) as tf.Tensor;

    // Get the prediction value and confidence
    const predictionValue = prediction.dataSync()[0]; // Value between 0 and 1
    const confidence = Math.abs(1 - predictionValue); // Confidence score

    // Dispose of the tensor to free memory
    prediction.dispose();

    // Log the prediction and confidence
    console.log(`Prediction (0: No movement, 1: Movement): ${predictionValue}`);
    console.log(`Confidence: ${confidence}`);

    // Return prediction and confidence
    return {
      prediction: predictionValue > 0.5 ? 1 : 0, // 1 for movement, 0 for no movement
      confidence: confidence, // Confidence score
    };
  }

  // **Prepare Sequence Data for Prediction**
  prepareSequenceDataFromBeacons(): number[] {
    const sequenceData: number[] = [];
    for (const beaconId of this.selectedBeaconMacIds) {
      const beaconSequence = this.sample.sequence[beaconId];
      if (beaconSequence && beaconSequence.length > 0) {
        sequenceData.push(...beaconSequence.slice(-this.sequenceLength)); // Latest RSSI values
      } else {
        console.warn(`No RSSI data for beacon: ${beaconId}`);
        return [];
      }
    }
    return sequenceData;
  }

  // **Helper function to check if an array contains all elements**
  containsAll(arr1: any[], arr2: any[]): boolean {
    return arr2.every((element) => arr1.includes(element));
  }

  // **Start continuous prediction**
  startContinuousPrediction() {
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval); // Clear any previous prediction interval
    }

    this.predictionInterval = setInterval(async () => {
      const result = await this.predictMovement();
      if (result) {
        console.log('Continuous Prediction Result:', result);
      }
    }, 1000); // Predict every 1 second (adjust as needed)
  }

  // **Stop continuous prediction**
  stopContinuousPrediction() {
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval); // Stop continuous prediction
    }
  }
}
