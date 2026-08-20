import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ProductPayload } from '../../../core/models/product.model';
import { ProductForm } from '../product-form/product-form';

@Component({
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  imports: [ProductForm],
})
export class ProductCreateComponent {}
