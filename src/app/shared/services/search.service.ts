import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchInput$ = new BehaviorSubject<string>('');

  setSearchInput(query: string) {
    this.searchInput$.next(query);
  }
}
