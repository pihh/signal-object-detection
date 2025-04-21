import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  standalone: false,
})
export class InfoComponent implements OnInit {
  @Input('title') title: string = 'Info';
  @Input('about') about: string = 'About description';
  @Input('tech') tech: string[] = [];

  signature: string = 'Filipe Mota de Sá aka Pihh.';
  git: string = 'https://github.com/pihh';
  constructor() {}

  ngOnInit() {}
}
