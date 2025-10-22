import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../../auth/services/ayth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from "rxjs";
import {faCartShopping, faRightFromBracket} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  faCartShopping = faCartShopping;
  faRightFromBracket = faRightFromBracket;

  searchQuery = '';
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const q = params['q'] || '';
      if (this.searchQuery !== q) {
        this.searchQuery = q;
      }
    });

    this.searchInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        this.router.navigate(['/search-results'], {queryParams: {q: query}});
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery = query;
    this.searchInput$.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchInput$.next('');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
