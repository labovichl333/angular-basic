import {inject, Injectable, Injector} from '@angular/core';
import {catchError, map, Observable, of, switchMap} from "rxjs";
import {User} from "../../shared/models/users.model";
import {UserService} from "../../shared/services/user.service";
import {CartService} from "../../cart/services/cart.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userKey = 'currentUser';

  private userService = inject(UserService);
  private injector = inject(Injector);


  private get cartService(): CartService {
    return this.injector.get(CartService);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.userService.getUserByEmail(email).pipe(
      switchMap(user => {
        if (user && user.password === password) {
          localStorage.setItem(this.userKey, JSON.stringify(user));
          return this.cartService.mergeLocalCartWithServer().pipe(
            map(() => true)
          );
        }
        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  register(email: string, password: string): Observable<boolean> {
    return this.userService.isEmailUnique(email).pipe(
      switchMap(isUnique => {
        if (!isUnique) return of(false);
        return this.userService.createUser(email, password).pipe(
          switchMap(user => {
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return this.cartService.mergeLocalCartWithServer().pipe(
              map(() => true)
            );
          })
        );
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.cartService.initializeCart()
  }
}
