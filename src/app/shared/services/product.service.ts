import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Product} from "../models/product.model";
import {Observable} from "rxjs";
import {Review} from "../models/review.model";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = "http://localhost:3000";

  private http = inject(HttpClient)

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getReviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews?productId=${productId}`);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${product.id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  getAllProducts(filters: {
    priceFrom?: number | null;
    priceTo?: number | null;
    ratingFrom?: number | null;
    ratingTo?: number | null;
    inStock?: boolean;
    hasReviews?: boolean;
  } | null): Observable<Product[]> {
    let params = new HttpParams();

    if (filters) {

      if (filters.priceFrom != null) params = params.set('price_gte', filters.priceFrom.toString());
      if (filters.priceTo != null) params = params.set('price_lte', filters.priceTo.toString());

      if (filters.ratingFrom != null) params = params.set('rating.rate_gte', filters.ratingFrom.toString());
      if (filters.ratingTo != null) params = params.set('rating.rate_lte', filters.ratingTo.toString());

      if (filters.inStock) {
        params = params.set('stock_gt', '0');
      }

      if (filters.hasReviews) {
        params = params.set('hasReviews', "true");
      }
    }

    return this.http.get<Product[]>(`${this.baseUrl}/products`, {params});
  }
}
