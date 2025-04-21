import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { BeaconListItemComponent } from './beacon-list-item.component';
import { LayoutComponentModule } from '../layout/layout.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LayoutComponentModule],
  declarations: [BeaconListItemComponent],
  exports: [BeaconListItemComponent],
})
export class BeaconListItemComponentModule {}
