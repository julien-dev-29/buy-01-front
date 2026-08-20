import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { NotFoundComponent } from './components/not-found/not-found';
import { LoginComponent } from './components/auth/login/login';
import { MyProductsComponent } from './components/products/my-products/my-products';
import { ProductCreateComponent } from './components/products/product-create/product-create';

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
    path: 'product-create',
    component: ProductCreateComponent,
  },
  { path: 'my-products', component: MyProductsComponent },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
