import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import Long from 'long';
console.log(Long)
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
