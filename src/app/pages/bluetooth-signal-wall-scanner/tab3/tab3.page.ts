import { Component } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  title: string = PROJECT.title;
  constructor() {}

  async ngAfterViewInit() {}
}
