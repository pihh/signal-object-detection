import { Component } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  title: string = PROJECT.title;
  constructor() {}

  async ngAfterViewInit() {}
}
