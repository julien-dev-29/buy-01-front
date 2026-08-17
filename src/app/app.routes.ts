import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { NotFoundComponent } from './components/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
