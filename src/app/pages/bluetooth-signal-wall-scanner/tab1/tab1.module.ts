import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../../../components/explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ScannerComponentModule } from 'src/app/components/scanner/scanner.module';
import { TrainComponentModule } from 'src/app/components/train/train.module';
import { PredictComponentModule } from 'src/app/components/predict/predict.module';
import { LayoutComponentModule } from 'src/app/components/layout/layout.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    ScannerComponentModule,
    LayoutComponentModule,
  ],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
