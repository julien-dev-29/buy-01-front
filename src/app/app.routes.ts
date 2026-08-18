import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { NotFoundComponent } from './components/not-found/not-found';
import { LoginComponent } from './components/auth/login/login';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
