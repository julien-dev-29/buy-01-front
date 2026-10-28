import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ProductPayload } from '../../core/models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

@Component({
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [MatCardModule, MatGridListModule, RouterLink],
})
export class HomeComponent {
  protected readonly _snackBar = inject(MatSnackBar);
  protected readonly http = inject(HttpClient);
  products = signal<ProductPayload[]>([]);
  response = this.http
    .get<ProductPayload[]>('http://localhost:9000/api/products')
    .subscribe((res) => this.products.set(res));
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
