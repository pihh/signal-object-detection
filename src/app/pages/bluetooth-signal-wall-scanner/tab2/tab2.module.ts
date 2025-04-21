import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../../../components/explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { ScannerComponentModule } from 'src/app/components/scanner/scanner.module';
import { TrainComponentModule } from 'src/app/components/train/train.module';
import { PredictComponentModule } from 'src/app/components/predict/predict.module';
import { LayoutComponentModule } from 'src/app/components/layout/layout.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    LayoutComponentModule,
    TrainComponentModule,
    Tab2PageRoutingModule,
  ],
  declarations: [Tab2Page],
})
export class Tab2PageModule {}
