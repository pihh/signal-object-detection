import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export const PROJECTS: any = {
  BLUETOOTH_WALL_SCANNER: {
    id: 'BLUETOOTH_WALL_SCANNER',
    title: 'Bluetooth Vision',
    url: '/tabs/tab1',
    icon: 'body',
    tabs: [1, 2, 3, 4],
  },
  BLUETOOTH_POSITION_TRIANGULATION: {
    id: 'BLUETOOTH_POSITION_TRIANGULATION',
    title: 'Bluetooth Triangulation',
    url: '/tabs/tab5',
    icon: 'triangle',
    tabs: [5, 6, 7, 8],
  },
};

export const PROJECT_STORAGE_KEYS: any = {
  CURRENT_PROJECT: 'current-project',
  DEFAULT_PROJECT: 'BLUETOOTH_WALL_SCANNER',
};

export const PROJECT_EVENTS: any = {
  PROJECT_CHANGE: 'project:change',
};

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  currentProject: any = PROJECTS[PROJECT_STORAGE_KEYS.DEFAULT_PROJECT];

  constructor(public storage: Storage) {
    this.init();
  }

  private async init() {
    await this.storage.create();
    let currentProject = await this.storage.get(
      PROJECT_STORAGE_KEYS.CURRENT_PROJECT
    );
    this.onProjectChange(
      currentProject || PROJECT_STORAGE_KEYS.DEFAULT_PROJECT
    );
  }

  onProjectChange(projectname: string): Promise<boolean> {
    return this.storage
      .set(PROJECT_STORAGE_KEYS.CURRENT_PROJECT, projectname)
      .then(() => {
        this.currentProject = PROJECTS[projectname];
        return window.dispatchEvent(
          new CustomEvent(PROJECT_EVENTS.PROJECT_CHANGE, {
            detail: this.currentProject,
          })
        );
      });
  }

  get projectNames() {
    return Object.keys(PROJECTS);
  }
}
