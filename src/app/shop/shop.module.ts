import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ShopRoutingModule} from './shop-routing.module';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {ProductDetailsPageComponent} from "./pages/product-details-page/product-details-page.component";
import {ProductEditPageComponent} from "./pages/product-edit-page/product-edit-page.component";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    HomePageComponent,
    ProductDetailsPageComponent,
    ProductEditPageComponent
  ],
  imports: [
    CommonModule,
    ShopRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ShopModule {
}
