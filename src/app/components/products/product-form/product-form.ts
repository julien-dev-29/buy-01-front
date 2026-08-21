import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ProductPayload } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { Router } from '@angular/router';

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
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  protected errorMessage = signal<string>('Wesh');
  protected productFormModel = signal<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    mediaIds: [],
  });
  protected form = form(this.productFormModel);

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('yala');
    this.productService
      .create(this.productFormModel())
      .subscribe((res) => res.id ?? this.errorMessage.set('Error wala'));
  }
}
