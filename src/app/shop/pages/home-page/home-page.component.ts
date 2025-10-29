import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {Product} from "../../../shared/models/product.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {Filters} from "../../models/filters";
import {SearchService} from "../../../shared/services/search.service";

const FILTER_CONFIG: Record<keyof Filters, {
  type: 'number' | 'boolean';
  default: any;
  min?: number;
  max?: number;
  labelPrefix: string;
  unit?: string;
}> = {
  priceFrom: {type: 'number', default: null, min: 0, labelPrefix: 'Price from', unit: '$'},
  priceTo: {type: 'number', default: null, min: 0, labelPrefix: 'Price to', unit: '$'},
  ratingFrom: {type: 'number', default: null, min: 0, max: 5, labelPrefix: 'Rating from', unit: '★'},
  ratingTo: {type: 'number', default: null, min: 0, max: 5, labelPrefix: 'Rating to', unit: '★'},
  inStock: {type: 'boolean', default: false, labelPrefix: 'In stock'},
  hasReviews: {type: 'boolean', default: false, labelPrefix: 'Has reviews'}
};

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private queryParamsSubscription!: Subscription;

  products: Product[] = [];
  appliedFilters: { key: string; label: string }[] = [];
  search$!: Observable<string>;
  loading = true;
  error: string | null = null;

  filterForm: FormGroup = this.fb.group(
    Object.fromEntries(
      Object.entries(FILTER_CONFIG).map(([key, config]) => [key, [config.default]])
    )
  );

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.patchFormFromQueryParams(params);
      this.applyFilters();
    });
    this.search$ = this.searchService.searchInput$
  }

  private patchFormFromQueryParams(params: Record<string, string>): void {
    const patchValue: Partial<Filters> = {};

    for (const key of Object.keys(FILTER_CONFIG) as Array<keyof Filters>) {
      const paramValue = params[key];
      if (paramValue == null) continue;

      const config = FILTER_CONFIG[key];
      if (config.type === 'boolean') {
        if (paramValue === 'true') patchValue[key] = true as any;
      } else if (config.type === 'number') {
        const num = +paramValue;
        if (!isNaN(num)) patchValue[key] = num as any;
      }
    }

    this.filterForm.patchValue(patchValue, {emitEvent: false});
  }

  clampPrice(controlName: 'priceFrom' | 'priceTo'): void {
    this.clampControl(controlName);
  }

  clampRating(controlName: 'ratingFrom' | 'ratingTo'): void {
    this.clampControl(controlName);
  }

  private clampControl(controlName: keyof Filters): void {
    const control = this.filterForm.get(controlName);
    if (!control) return;

    const config = FILTER_CONFIG[controlName];
    if (config.type !== 'number') return;

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

    if (config.min !== undefined) value = Math.max(config.min, value);
    if (config.max !== undefined) value = Math.min(config.max, value);
    value = Math.round(value * 10) / 10;

    control.setValue(value, {emitEvent: false});
  }

  applyFilters(): void {
    const rawValues = this.filterForm.value;

    const filters = Object.keys(FILTER_CONFIG).reduce((acc, key) => {
      const k = key as keyof Filters;
      const config = FILTER_CONFIG[k];
      let value = rawValues[k];

      if (config.type === 'number') {
        value = (value != null && !isNaN(Number(value))) ? Number(value) : null;
      } else if (config.type === 'boolean') {
        value = !!value;
      }

      return {...acc, [k]: value};
    }, {} as Filters);

    const queryParams: Record<string, string | boolean> = {};
    for (const key of Object.keys(FILTER_CONFIG) as Array<keyof Filters>) {
      const val = filters[key];
      const config = FILTER_CONFIG[key];

      if (config.type === 'boolean') {
        if (val) queryParams[key] = true;
      } else if (config.type === 'number') {
        if (val != null) queryParams[key] = val.toString();
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });

    this.productService.getAllProducts(filters).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.appliedFilters = this.getActiveFiltersFrom(filters);
      },
      error: () => {
        this.error = 'Failed to load products';
        this.loading = false;
        this.appliedFilters = this.getActiveFiltersFrom(filters);
      }
    });
  }

  removeFilter(key: string): void {
    if (!(key in FILTER_CONFIG)) return;

    const defaultValue = FILTER_CONFIG[key as keyof Filters].default;
    this.filterForm.get(key)?.setValue(defaultValue);
    this.applyFilters();
  }

  clearAllFilters(): void {
    const resetValues: Partial<Filters> = {};
    for (const key of Object.keys(FILTER_CONFIG) as Array<keyof Filters>) {
      resetValues[key] = FILTER_CONFIG[key].default;
    }
    this.filterForm.reset(resetValues);
    this.applyFilters();
  }

  private getActiveFiltersFrom(filters: Filters): { key: string; label: string }[] {
    const active: { key: string; label: string }[] = [];

    for (const key of Object.keys(FILTER_CONFIG) as Array<keyof Filters>) {
      const val = filters[key];
      const config = FILTER_CONFIG[key];

      if (config.type === 'boolean' && !val) continue;
      if (config.type === 'number' && (val == null || isNaN(val as any))) continue;

      let label = config.labelPrefix;
      if (config.type === 'number') {
        label += ` ${config.unit || ''}${val}`;
      }

      active.push({key, label});
    }

    return active;
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }
}
