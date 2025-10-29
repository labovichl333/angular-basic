import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from "./components/header/header.component";
import {ReviewComponent} from "./components/review/review.component";
import {AvailabilityColorDirective} from "./directives/availability-color.directive";
import {AddToCartComponent} from "./components/add-to-cart/add-to-cart.component";
import {ProductsFeedComponent} from "./components/products-feed/products-feed.component";
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule} from "@angular/forms";
import {SearchPipe} from './pipes/search-pipe';


@NgModule({
  declarations: [
    HeaderComponent,
    ReviewComponent,
    AvailabilityColorDirective,
    AddToCartComponent,
    ProductsFeedComponent,
    SearchPipe
  ],
  exports: [
    ProductsFeedComponent,
    ReviewComponent,
    AddToCartComponent,
    AvailabilityColorDirective,
    HeaderComponent,
    SearchPipe
  ],
  imports: [
    CommonModule,
    RouterLink,
    FaIconComponent,
    FormsModule
  ]
})
export class SharedModule {
}
