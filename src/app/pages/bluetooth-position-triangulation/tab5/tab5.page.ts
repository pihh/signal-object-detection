import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false,
})
export class Tab5Page implements OnInit {
  title: string = PROJECT.title;
  constructor() {}

  ngOnInit() {}
}
