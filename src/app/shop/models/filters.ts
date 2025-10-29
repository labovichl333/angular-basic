export interface Filters {
  priceFrom: number | null;
  priceTo: number | null;
  ratingFrom: number | null;
  ratingTo: number | null;
  inStock: boolean;
  hasReviews: boolean;
}
