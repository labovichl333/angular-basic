import {Component, inject} from '@angular/core';
import {SearchService} from "../../../shared/services/search.service";
import {map, switchMap} from "rxjs";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent {
  searchService = inject(SearchService);
  route = inject(ActivatedRoute);

  products$ = this.route.queryParams.pipe(
    map(params => params['q'] || ''),
    switchMap(query => this.searchService.searchProducts(query))
  );
}
