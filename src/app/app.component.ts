import { Component } from '@angular/core';
import {
  PROJECT_EVENTS,
  PROJECT_STORAGE_KEYS,
  PROJECTS,
  ProjectService,
} from './services/project.service';
import { tan } from '@tensorflow/tfjs';

const MENU_TABS = Object.values(PROJECTS) || [];
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  appPages: any = MENU_TABS;

  selected = PROJECT_STORAGE_KEYS.DEFAULT_PROJECT;

  constructor(private projectService: ProjectService) {
    window.addEventListener(PROJECT_EVENTS.PROJECT_CHANGE, (event: any) => {
      this.selected = event.detail.id;
    });
  }

  onSelectProject(id: string) {
    this.projectService.onProjectChange(id);
  }
}
