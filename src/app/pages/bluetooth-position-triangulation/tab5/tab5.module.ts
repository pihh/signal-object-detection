import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab5PageRoutingModule } from './tab5-routing.module';

import { Tab5Page } from './tab5.page';
import { LayoutComponentModule } from 'src/app/components/layout/layout.module';
import { BluetoothDevicesComponentModule } from 'src/app/components/bluetooth-devices/module';
import { FloorMapComponentModule } from 'src/app/components/floor-map/floor-map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab5PageRoutingModule,
    LayoutComponentModule,
    FloorMapComponentModule,
    BluetoothDevicesComponentModule,
  ],
  declarations: [Tab5Page],
})
export class Tab5PageModule {}
