import {Component, inject} from '@angular/core';
import {AuthService} from "../../../auth/services/auth.service";
import {Router} from "@angular/router";
import {faCartShopping, faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import {SearchService} from "../../services/search.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  searchService = inject(SearchService);
  router = inject(Router);
  faCartShopping = faCartShopping;
  faRightFromBracket = faRightFromBracket;

  searchQuery = '';

  onSearchInput(): void {
    this.searchService.setSearchInput(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.setSearchInput('');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
