import { Component } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  title = PROJECT.title;
  about = `This project collects bluetooth signal information and tries to predict what's in front of it`;
  tech = [
    'Tensorflow',
    'Bluetooth',
    'Wifi Scan',
    'ionic',
    'capacitor',
    'angular',
  ];
  constructor() {}

  async ngAfterViewInit() {}
}
