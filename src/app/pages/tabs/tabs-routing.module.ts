import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () =>
          import('../bluetooth-signal-wall-scanner/tab1/tab1.module').then(
            (m) => m.Tab1PageModule
          ),
      },
      {
        path: 'tab2',
        loadChildren: () =>
          import('../bluetooth-signal-wall-scanner/tab2/tab2.module').then(
            (m) => m.Tab2PageModule
          ),
      },
      {
        path: 'tab3',
        loadChildren: () =>
          import('../bluetooth-signal-wall-scanner/tab3/tab3.module').then(
            (m) => m.Tab3PageModule
          ),
      },
      {
        path: 'tab4',
        loadChildren: () =>
          import('../bluetooth-signal-wall-scanner/tab4/tab4.module').then(
            (m) => m.Tab4PageModule
          ),
      },
      {
        path: 'tab5',
        loadChildren: () =>
          import('../bluetooth-position-triangulation/tab5/tab5.module').then(
            (m) => m.Tab5PageModule
          ),
      },
      {
        path: 'tab6',
        loadChildren: () =>
          import('../bluetooth-position-triangulation/tab6/tab6.module').then(
            (m) => m.Tab6PageModule
          ),
      },
      {
        path: 'tab7',
        loadChildren: () =>
          import('../bluetooth-position-triangulation/tab7/tab7.module').then(
            (m) => m.Tab7PageModule
          ),
      },
      {
        path: 'tab8',
        loadChildren: () =>
          import('../bluetooth-position-triangulation/tab8/tab8.module').then(
            (m) => m.Tab8PageModule
          ),
      },
      /*
           {
        path: 'tabx',
        loadChildren: () => import('../tabx/tabx.module').then(m => m.TabxPageModule)
      },
      */
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
