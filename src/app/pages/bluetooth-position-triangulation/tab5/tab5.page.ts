import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';
import { MovementService } from 'src/app/services/movement.service';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  title: string = PROJECT.title;
  constructor(public movementService: MovementService) {}

  ngOnInit() {}

  currentLabel: number = 0;
  labels = [
    { idx: 0, label: 'no movement' },
    { idx: 1, label: 'movement' },
  ];
  startCollecting() {
    this.movementService.startCollecting(this.currentLabel);
  }
  stopCollecting() {
    this.movementService.stopCollecting();
  }
}
