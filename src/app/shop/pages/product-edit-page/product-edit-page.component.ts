import {Component, inject, OnInit} from '@angular/core';
import {Product} from "../../../shared/models/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductService} from "../../../shared/services/product.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-product-edit-page',
  templateUrl: './product-edit-page.component.html',
  styleUrl: './product-edit-page.component.scss'
})
export class ProductEditPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product: Product | null = null;
  formPrice: string = '';
  formStock: string = '';

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          this.formPrice = product.price.toString();
          this.formStock = product.stock.toString();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load product';
          this.loading = false;
        }
      });
    }
  }

  isValidPrice(value: string): boolean {
    if (value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  isValidStock(value: string): boolean {
    if (value === '') return true;
    const num = parseInt(value, 10);
    return !isNaN(num) && isFinite(num) && num.toString() === value;
  }

  enforcePositive(controlName: 'price' | 'stock'): void {
    let value = controlName === 'price' ? this.formPrice : this.formStock;

    if (value === '') return;

    const num = parseFloat(value);
    if (isNaN(num)) return;

    if (num < 0) {
      const absValue = Math.abs(num);
      if (controlName === 'price') {
        this.formPrice = absValue.toString();
      } else {
        this.formStock = Math.floor(absValue).toString();
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (!this.product || !form.valid) return;

    if (!this.isValidPrice(this.formPrice) || !this.isValidStock(this.formStock)) {
      return;
    }

    const price = this.formPrice ? parseFloat(this.formPrice) : 0;
    const stock = this.formStock ? parseInt(this.formStock, 10) : 0;

    const updatedProduct: Product = {
      ...this.product,
      price,
      stock
    };

    this.productService.updateProduct(updatedProduct).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.router.navigate(['/product', this.product!.id]);
      },
      error: () => {
        this.error = 'Failed to update product';
      }
    });
  }
}
