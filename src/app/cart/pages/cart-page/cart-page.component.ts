import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CartItem} from "../../models/cart-item.model";
import {CartService} from "../../services/cart.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit, OnDestroy {
  private cartSubscription!: Subscription;
  cartService = inject(CartService)

  cartItems: CartItem[] = [];
  currentPage = 1;
  itemsPerPage = 4;
  totalPages = 1;

  ngOnInit(): void {
    this.cartService.initializeCart()
    this.cartSubscription = this.cartService.cartItems$.subscribe(value => {
      this.cartItems = value
      this.totalPages = Math.ceil(this.cartItems.length / this.itemsPerPage);
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    })
  }

  updateCount(productId: string, delta: number): void {
    const item = this.cartItems.find(i => i.id === productId);
    if (!item) return;

    const newCount = item.count + delta;
    if (newCount < 0) return;

    this.cartService.updateCount(productId, newCount);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedItems(): CartItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.cartItems.slice(start, end);
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
