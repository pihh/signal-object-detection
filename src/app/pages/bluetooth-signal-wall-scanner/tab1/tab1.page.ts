import { AfterViewInit, Component } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements AfterViewInit {
  title: string = PROJECT.title;
  constructor() {}

  async ngAfterViewInit() {}
}
