import {Component, OnDestroy, OnInit} from '@angular/core';
import {Product} from "../../../shared/models/product.model";
import {Review} from "../../../shared/models/review.model";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../../shared/services/product.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-details-page',
  templateUrl: './product-details-page.component.html',
  styleUrl: './product-details-page.component.scss'
})
export class ProductDetailsPageComponent implements OnInit, OnDestroy {
  private paramMapSubscription!: Subscription;
  product: Product | null = null;
  reviews: Review[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProductAndReviews(id);
      }
    });
  }

  loadProductAndReviews(productId: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loadReviews(productId);
      },
      error: (err) => {
        this.error = 'Failed to load product';
        this.loading = false;
      }
    });
  }

  loadReviews(productId: string): void {
    this.productService.getReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  getAvailabilityStatus(stock: number): string {
    if (stock > 10) {
      return 'In stock';
    } else if (stock > 0) {
      return 'Almost sold out';
    } else {
      return 'Out of stock';
    }
  }

  ngOnDestroy(): void {
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
  }
}
