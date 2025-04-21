import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TrainComponent } from './train.component';




@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [TrainComponent],
  exports: [TrainComponent]
})
export class TrainComponentModule {}
