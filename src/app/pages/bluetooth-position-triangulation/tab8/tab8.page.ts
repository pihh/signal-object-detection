import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab8',
  templateUrl: './tab8.page.html',
  styleUrls: ['./tab8.page.scss'],
  standalone: false,
})
export class Tab8Page implements OnInit {
  title = PROJECT.title;
  about = `This project uses 3 bluetooth beacons to triangulate positions and identify objects in that range`;
  tech = [
    'Tensorflow',
    'Bluetooth',
    'Wifi Scan',
    'ionic',
    'capacitor',
    'angular',
  ];
  constructor() {}

  ngOnInit() {}
}
