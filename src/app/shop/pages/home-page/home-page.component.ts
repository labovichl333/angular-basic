import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {Product} from "../../../shared/models/product.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private queryParamsSubscription!: Subscription;

  products: Product[] = [];

  loading = true;
  error: string | null = null;

  filterForm: FormGroup = this.fb.group({
    priceFrom: [null],
    priceTo: [null],
    ratingFrom: [null],
    ratingTo: [null],
    inStock: [false],
    hasReviews: [false]
  });

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.patchFormFromQueryParams(params);
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  patchFormFromQueryParams(params: any): void {
    const patchValue: any = {};

    if (params['priceFrom']) patchValue.priceFrom = +params['priceFrom'];
    if (params['priceTo']) patchValue.priceTo = +params['priceTo'];
    if (params['ratingFrom']) patchValue.ratingFrom = +params['ratingFrom'];
    if (params['ratingTo']) patchValue.ratingTo = +params['ratingTo'];
    if (params['inStock'] === 'true') patchValue.inStock = true;
    if (params['hasReviews'] === 'true') patchValue.hasReviews = true;

    this.filterForm.patchValue(patchValue, {emitEvent: false});
  }

  clampPrice(controlName: 'priceFrom' | 'priceTo'): void {
    this.clampControl(controlName, {min: 0});
  }

  clampRating(controlName: 'ratingFrom' | 'ratingTo'): void {
    this.clampControl(controlName, {min: 0, max: 5});
  }

  private clampControl(
    controlName: 'priceFrom' | 'priceTo' | 'ratingFrom' | 'ratingTo',
    options: { min?: number; max?: number } = {}
  ): void {
    const control = this.filterForm.get(controlName);
    if (!control) return;

    let value = control.value;

    if (value == null || value === '') {
      control.setValue(null, {emitEvent: false});
      return;
    }

    value = parseFloat(value);
    if (isNaN(value)) {
      control.setValue(null, {emitEvent: false});
      return;
    }

    if (options.min !== undefined) {
      value = Math.max(options.min, value);
    }
    if (options.max !== undefined) {
      value = Math.min(options.max, value);
    }

    value = Math.round(value * 10) / 10;

    control.setValue(value, {emitEvent: false});
  }

  applyFilters(): void {
    const {priceFrom, priceTo, ratingFrom, ratingTo, inStock, hasReviews} = this.filterForm.value;


    const clean = (v: any) => (v != null && !isNaN(v)) ? v : null;

    const filters = {
      priceFrom: clean(priceFrom),
      priceTo: clean(priceTo),
      ratingFrom: clean(ratingFrom),
      ratingTo: clean(ratingTo),
      inStock: !!inStock,
      hasReviews: !!hasReviews
    };

    const queryParams: Record<string, string | boolean> = {};
    if (filters.priceFrom !== null) queryParams['priceFrom'] = filters.priceFrom.toString();
    if (filters.priceTo !== null) queryParams['priceTo'] = filters.priceTo.toString();
    if (filters.ratingFrom !== null) queryParams['ratingFrom'] = filters.ratingFrom.toString();
    if (filters.ratingTo !== null) queryParams['ratingTo'] = filters.ratingTo.toString();
    if (filters.inStock) queryParams['inStock'] = true;
    if (filters.hasReviews) queryParams['hasReviews'] = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });

    this.productService.getAllProducts(filters).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  removeFilter(key: string): void {
    if (key === 'priceFrom') this.filterForm.get('priceFrom')?.setValue(null);
    if (key === 'priceTo') this.filterForm.get('priceTo')?.setValue(null);
    if (key === 'ratingFrom') this.filterForm.get('ratingFrom')?.setValue(null);
    if (key === 'ratingTo') this.filterForm.get('ratingTo')?.setValue(null);
    if (key === 'inStock') this.filterForm.get('inStock')?.setValue(false);
    if (key === 'hasReviews') this.filterForm.get('hasReviews')?.setValue(false);

    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      priceFrom: null,
      priceTo: null,
      ratingFrom: null,
      ratingTo: null,
      inStock: false,
      hasReviews: false
    });
    this.applyFilters();
  }

  getActiveFilters(): { key: string; label: string }[] {
    const value = this.filterForm.value;
    const filters: { key: string; label: string }[] = [];

    if (value.priceFrom != null) filters.push({key: 'priceFrom', label: `Price from $${value.priceFrom}`});
    if (value.priceTo != null) filters.push({key: 'priceTo', label: `Price to $${value.priceTo}`});
    if (value.ratingFrom != null) filters.push({key: 'ratingFrom', label: `Rating from ${value.ratingFrom}★`});
    if (value.ratingTo != null) filters.push({key: 'ratingTo', label: `Rating to ${value.ratingTo}★`});
    if (value.inStock) filters.push({key: 'inStock', label: 'In stock'});
    if (value.hasReviews) filters.push({key: 'hasReviews', label: 'Has reviews'});

    return filters;
  }
}
