import {inject, Injectable} from "@angular/core";
import {BehaviorSubject, map} from "rxjs";
import {Product} from "../models/product.model";
import {ProductService} from "./product.service";

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  products$ = new BehaviorSubject<Product[]>([]);

  productService = inject(ProductService);

  constructor() {
    this.productService.getAllProducts(null).subscribe(products => {
      this.products$.next(products);
    });
  }

  searchProducts(query: string) {
    return this.productService.getAllProducts(null).pipe(
      map(products => {
        if (!query.trim()) return products;
        const q = query.toLowerCase();
        return products.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      })
    );
  }
}
