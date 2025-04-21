import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';
import { MovementService } from 'src/app/services/movement.service';

@Component({
  selector: 'app-tab7',
  templateUrl: './tab7.page.html',
  styleUrls: ['./tab7.page.scss'],
  standalone: false,
})
export class Tab7Page implements OnInit {
  title: string = PROJECT.title;
  prediction: number | null = null;
  confidence: number | null = null;

  constructor(private movementService: MovementService) {}

  async predictMovement() {
    this.movementService.startContinuousPrediction();
  }

  stopPrediction() {
    this.movementService.stopContinuousPrediction();
  }
  ngOnInit() {}
}
