import {Component, inject, Input} from '@angular/core';
import {Product} from "../../models/product.model";
import {ProductService} from "../../services/product.service";

@Component({
  selector: 'app-products-feed',
  templateUrl: './products-feed.component.html',
  styleUrl: './products-feed.component.scss'
})
export class ProductsFeedComponent {
  @Input({required: true}) products!: Product[];

  productService = inject(ProductService)

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
          alert('Product deleted successfully!');
        },
        error: () => {
          alert('Failed to delete product');
        }
      });
    }
  }
}
