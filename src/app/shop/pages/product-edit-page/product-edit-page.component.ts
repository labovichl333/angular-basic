import {Component, inject, OnInit} from '@angular/core';
import {Product} from "../../../shared/models/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductService} from "../../../shared/services/product.service";

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
  formPrice: number = 0;
  formStock: number = 0;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          this.formPrice = product.price;
          this.formStock = product.stock;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load product';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.product) return;

    const updatedProduct: Product = {
      ...this.product,
      price: this.formPrice,
      stock: this.formStock
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
