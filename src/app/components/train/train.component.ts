import { Component, OnInit } from '@angular/core';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { MlModelService } from 'src/app/services/ml-model.service';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.scss'],
  standalone:false
})
export class TrainComponent  implements OnInit {

  labelCounts: any = []

  constructor(private dataStorage: DataStorageService, private mlService: MlModelService) {}

  ngOnInit() {

    console.log('train',this)
    this.updateCounts();
  }

  // Update the label counts
  async updateCounts() {
    const labelCounts = await this.dataStorage.countLabels();
    this.labelCounts = Object.entries(labelCounts)
  }

  // Getter to display labels dynamically in the template
  get labels(): string[] {
    return Object.keys(this.labelCounts);
  }
 



  async trainModel() {
    
    const entries = await this.dataStorage.getAllEntries();
    const allDeviceIds = Array.from(new Set(entries.map(e => e.id)));
    const grouped: { [key: string]: { [deviceId: string]: number[] } } = {};

    for (const entry of entries) {
      const sec = Math.floor(entry.timestamp / 1000);
      const key = `${entry.label}_${sec}`;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][entry.id]) grouped[key][entry.id] = [];
      grouped[key][entry.id].push(entry.rssi);
    }

    const samples = Object.entries(grouped).map(([key, devices]) => {
      const label = key.split('_')[0];
      const features = allDeviceIds.map(id => {
        const values = devices[id];
        if (values && values.length) {
          return values.reduce((a, b) => a + b, 0) / values.length;
        } else {
          return -100;
        }
      });
      return { features, label };
    });

    await this.mlService.trainModel(samples);
    
  }

  async predictLive() {
    /*
    const allDeviceIds = Object.keys(this.rssiSnapshot);
    const allKnownIds = await this.dataStorage.getAllEntries().then(e => Array.from(new Set(e.map(x => x.id))));
    const featureVector = allKnownIds.map(id => this.rssiSnapshot[id] ?? -100);
    const prediction = await this.mlService.predict(featureVector);
    this.predictionLabel = prediction;
    */
  }

  async exportMLDataset() {
    
    const entries = await this.dataStorage.getAllEntries();

    const grouped: { [key: string]: { [deviceId: string]: number[] } } = {};

    for (const entry of entries) {
      const second = Math.floor(entry.timestamp / 1000);
      const key = `${entry.label}_${second}`;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][entry.id]) grouped[key][entry.id] = [];
      grouped[key][entry.id].push(entry.rssi);
    }

    const allDeviceIds = Array.from(new Set(entries.map(d => d.id)));

    const rows: string[] = [];
    const header = [...allDeviceIds.map(id => `rssi_${id}`), 'label'].join(',');
    rows.push(header);

    for (const [key, devices] of Object.entries(grouped)) {
      const parts = key.split('_');
      const label = parts.slice(0, -1).join('_');
      const row: string[] = [];
      for (const id of allDeviceIds) {
        const values = devices[id];
        if (values && values.length) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          row.push(avg.toFixed(2));
        } else {
          row.push('-100');
        }
      }
      row.push(label);
      rows.push(row.join(','));
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ml_dataset.csv';
    a.click();
    
  }

}
