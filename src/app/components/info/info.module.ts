import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { InfoComponent } from './info.component';
import { LayoutComponentModule } from '../layout/layout.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LayoutComponentModule],
  declarations: [InfoComponent],
  exports: [InfoComponent],
})
export class InfoComponentModule {}
