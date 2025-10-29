import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {CartItem} from '../models/cart-item.model';
import {AuthService} from "../../auth/services/auth.service";
import {Product} from "../../shared/models/product.model";

interface ServerCart {
  id: number;
  userId: number;
  products: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private CART_LOCAL_KEY = 'cartItems';
  private baseUrl = 'http://localhost:3000/cart';

  private http = inject(HttpClient)
  private authService = inject(AuthService)

  cartItems: CartItem[] = [];
  cartItems$: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>(this.cartItems);

  initializeCart() {
    let cart = null;

    if (this.authService.isLoggedIn()) {
      cart = this.loadServerCartItems();
    } else {
      cart = of(this.loadLocalCart());
    }
    cart.subscribe(value => {
      this.cartItems = value;
      this.cartItems$.next(value);
    })
  }

  getCart(): CartItem[] {
    return this.cartItems
  }

  getProductCount(productId: string): number {
    return this.findCartItem(productId)?.count ?? 0;
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      count: 0
    };
    if (this.authService.isLoggedIn()) {
      const updated = this.updateCartItemCount(this.getCart(), cartItem, 1);
      this.saveCartOnServer(updated);
    } else {
      const cart = this.loadLocalCart();
      const updated = this.updateCartItemCount(cart, cartItem, 1);
      this.saveLocalCart(updated);
    }
  }

  increaseCount(productId: string): void {
    this.changeCount(productId, 1);
  }

  decreaseCount(productId: string): void {
    this.changeCount(productId, -1);
  }

  updateCount(productId: string, newCount: number): void {
    if (newCount < 1) {
      this.removeFromCart(productId);
      return;
    }

    if (this.authService.isLoggedIn()) {
      const cart = this.getCart()
      const item = cart.find(p => p.id === productId);
      if (item) {
        item.count = newCount;
        this.saveCartOnServer(cart);
      }

    } else {
      const cart = this.loadLocalCart();
      const item = cart.find(p => p.id === productId);
      if (item) {
        item.count = newCount;
        this.saveLocalCart(cart);
      }
    }
  }

  removeFromCart(productId: string): void {
    if (this.authService.isLoggedIn()) {
      const cart = this.getCart()
      const updated = cart.filter(p => p.id !== productId);
      this.saveCartOnServer(updated);
    } else {
      const cart = this.loadLocalCart();
      const updated = cart.filter(p => p.id !== productId);
      this.saveLocalCart(updated);
    }
  }

  findCartItem(productId: string): CartItem | undefined {
    return this.getCart().find(item => item.id === productId)
  }

  getTotalPrice(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.count, 0)
  }

  private loadLocalCart(): CartItem[] {
    const data = localStorage.getItem(this.CART_LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalCart(cart: CartItem[]): void {
    localStorage.setItem(this.CART_LOCAL_KEY, JSON.stringify(cart));
    this.cartItems = cart
    this.cartItems$.next(cart)
  }

  private loadServerCartItems(): Observable<CartItem[]> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return of([]);

    return this.http.get<ServerCart[]>(`${this.baseUrl}?userId=${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[0].products : [])
    );
  }

  private saveCartOnServer(products: CartItem[]): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    this.http.get<ServerCart[]>(`${this.baseUrl}?userId=${userId}`).subscribe(existingCarts => {
      if (existingCarts.length > 0) {
        const cartId = existingCarts[0].id;
        this.http.put<ServerCart>(`${this.baseUrl}/${cartId}`, {
          id: cartId,
          userId,
          products
        }).subscribe({
          next: () => {
            this.cartItems = products
            this.cartItems$.next(products)
          }
        });
      } else {
        this.http.post<ServerCart>(this.baseUrl, {
          userId,
          products
        }).subscribe({
            next: () => {
              this.cartItems = products
              this.cartItems$.next(products)
            }
          }
        );
      }
    });
  }

  private changeCount(productId: string, delta: number): void {
    if (this.authService.isLoggedIn()) {

      const cart = this.getCart()

      const item = cart.find(p => p.id === productId);
      if (item) {
        const newCount = item.count + delta;
        if (newCount <= 0) {
          this.removeFromCart(productId);
        } else {
          item.count = newCount;
          this.saveCartOnServer(cart);
        }
      }
    } else {
      const cart = this.loadLocalCart();
      const item = cart.find(p => p.id === productId);
      if (item) {
        const newCount = item.count + delta;
        if (newCount <= 0) {
          this.removeFromCart(productId);
        } else {
          item.count = newCount;
          this.saveLocalCart(cart);
        }
      }
    }
  }

  private updateCartItemCount(
    cart: CartItem[],
    cartItem: CartItem,
    delta: number = 1
  ): CartItem[] {
    const existing = cart.find(item => item.id === cartItem.id);
    if (existing) {
      existing.count += delta;
    } else {
      cart.push({...cartItem, count: delta});
    }
    return cart;
  }

  mergeLocalCartWithServer(): Observable<void> {

    if (!this.authService.isLoggedIn()) return of(undefined);

    const localCart = this.loadLocalCart();

    if (localCart.length === 0) {
      this.initializeCart();
      return of(undefined);
    }

    return this.loadServerCartItems().pipe(
      switchMap(serverCartItems => {
        const merged = this.mergeCarts(serverCartItems, localCart);
        this.saveCartOnServer(merged);
        this.clearLocalCart()
        this.initializeCart()
        return of(undefined);
      })
    );
  }

  clearLocalCart(): void {
    localStorage.removeItem(this.CART_LOCAL_KEY);
  }

  private mergeCarts(server: CartItem[], local: CartItem[]): CartItem[] {
    const mergedMap = new Map<string, CartItem>();

    server.forEach(item => {
      mergedMap.set(item.id, {...item});
    });

    local.forEach(item => {
      if (mergedMap.has(item.id)) {
        const existing = mergedMap.get(item.id)!;
        existing.count = Math.max(existing.count, item.count);
      } else {
        mergedMap.set(item.id, {...item});
      }
    });

    return Array.from(mergedMap.values());
  }
}
