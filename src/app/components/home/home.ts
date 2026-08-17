import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [MatCardModule, MatGridListModule],
})
export class HomeComponent {
  protected readonly _snackBar = inject(MatSnackBar);
  protected readonly http = inject(HttpClient);
  products = signal<Product[]>([]);
  response = this.http
    .get<Product[]>('http://localhost:9000/api/products')
    .subscribe((res) => this.products.set(res));
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }
}
