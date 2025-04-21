import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ScannerComponent } from './scanner.component';



@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [ScannerComponent],
  exports: [ScannerComponent]
})
export class ScannerComponentModule {}
