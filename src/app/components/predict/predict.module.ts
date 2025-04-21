import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PredictComponent } from './predict.component';



@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [PredictComponent],
  exports: [PredictComponent]
})
export class PredictComponentModule {}
