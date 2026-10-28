import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ProductPayload } from '../../../core/models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  templateUrl: './my-products.html',
  styleUrl: './my-products.css',
  imports: [MatCardModule, MatGridListModule],
})
export class MyProductsComponent {
  private readonly http = inject(HttpClient);
  protected readonly products = signal<ProductPayload[]>([]);
  private response = this.http
    .get<ProductPayload[]>('http://localhost:9000/api/products/me')
    .subscribe((res) => this.products.set(res));
}
