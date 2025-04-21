import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab7',
  templateUrl: './tab7.page.html',
  styleUrls: ['./tab7.page.scss'],
  standalone: false,
})
export class Tab7Page implements OnInit {
  title: string = PROJECT.title;
  constructor() {}

  ngOnInit() {}
}
