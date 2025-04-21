import { Component } from '@angular/core';
import {
  PROJECT_EVENTS,
  PROJECTS,
  ProjectService,
} from 'src/app/services/project.service';

const TAB_LIST: any = Object.values(PROJECTS)
  .map((p: any) => p.tabs)
  .flat();
const TAB_NAMING_CONVENTION: any = [
  ['pricetag', 'Classify'],
  ['barbell', 'Train'],
  ['stats-chart', 'Predict'],
  ['information-circle', 'Info'],
];

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  selected: number[] = [1, 2, 3];
  tabList: any[] = TAB_LIST;
  tabNamingConvention: [string, string][] = TAB_NAMING_CONVENTION;
  constructor(private projectService: ProjectService) {
    window.addEventListener(PROJECT_EVENTS.PROJECT_CHANGE, (event: any) => {
      this.selected = [...event.detail.tabs];
    });
  }
}
