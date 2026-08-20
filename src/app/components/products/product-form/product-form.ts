import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ProductPayload } from '../../../core/models/product.model';

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  mediaIds: string[];
};

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormField,
    MatAnchor,
  ],
})
export class ProductForm {
  private readonly http = inject(HttpClient);
  protected productFormModel = signal<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    mediaIds: [],
  });
  protected form = form(this.productFormModel);

  onSubmit(event: Event) {
    event.preventDefault();
    const response = this.http
      .post<ProductPayload>('http://localhost:9000/api/products', this.productFormModel())
      .subscribe();
    const credentials = this.productFormModel();
    console.log('Logging in with:', credentials);
  }
}
