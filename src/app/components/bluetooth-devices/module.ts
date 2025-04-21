import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { BluetoothDevicesComponent } from './bluetooth-devices.component';
import { LayoutComponentModule } from '../layout/layout.module';
import { BeaconListItemComponentModule } from '../beacon-list-item/module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LayoutComponentModule,
    BeaconListItemComponentModule,
  ],
  declarations: [BluetoothDevicesComponent],
  exports: [BluetoothDevicesComponent],
})
export class BluetoothDevicesComponentModule {}
