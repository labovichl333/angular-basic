import {Pipe, PipeTransform} from '@angular/core';
import {Product} from "../models/product.model";

@Pipe({
  name: 'search',
  standalone: false
})
export class SearchPipe implements PipeTransform {

  transform(items: Product[], searchQuery: string | null): Product[] {
    if (items.length === 0) return [];
    const query = (searchQuery ?? '').trim().toLowerCase();
    if (!query) return items;
    return items.filter((product) => product.title?.toLowerCase().includes(query));
  }
}
