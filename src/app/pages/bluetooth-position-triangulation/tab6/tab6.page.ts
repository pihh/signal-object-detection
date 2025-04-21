import { Component, OnInit } from '@angular/core';
import { PROJECT } from '../constants';

@Component({
  selector: 'app-tab6',
  templateUrl: './tab6.page.html',
  styleUrls: ['./tab6.page.scss'],
  standalone: false,
})
export class Tab6Page implements OnInit {
  title: string = PROJECT.title;
  constructor() {}

  ngOnInit() {}
}
