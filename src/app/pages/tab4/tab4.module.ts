import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';
import { ExploreContainerComponentModule } from '../../components/explore-container/explore-container.module';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { ScannerComponentModule } from 'src/app/components/scanner/scanner.module';
import { TrainComponentModule } from 'src/app/components/train/train.module';
import { PredictComponentModule } from 'src/app/components/predict/predict.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,

    ScannerComponentModule,
    TrainComponentModule,
    PredictComponentModule,
    Tab4PageRoutingModule
  ],
  declarations: [Tab4Page]
})
export class Tab4PageModule {}
