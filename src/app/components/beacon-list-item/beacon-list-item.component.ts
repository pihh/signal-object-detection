import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-beacon-list-item',
  templateUrl: './beacon-list-item.component.html',
  styleUrls: ['./beacon-list-item.component.scss'],
  standalone: false,
})
export class BeaconListItemComponent implements OnInit {
  @Input('beacon') beacon: any = {};
  @Input('selected') selected: any = false;
  @Input('listed') listed: any = false;

  @Output() toggleListedBeacon = new EventEmitter<string>();
  @Output() toggleSelectedBeacon = new EventEmitter<string>();

  onToggleListedBeacon(beacon: any) {
    this.toggleListedBeacon.emit(beacon);
  }

  onToggleSelectedBeacon(beacon: any) {
    this.toggleSelectedBeacon.emit(beacon);
  }
  constructor() {}

  ngOnInit() {}
}
