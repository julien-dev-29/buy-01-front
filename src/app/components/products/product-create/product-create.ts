import { Component } from '@angular/core';
import { ProductForm } from '../product-form/product-form';

@Component({
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  imports: [ProductForm],
})
export class ProductCreateComponent {}
