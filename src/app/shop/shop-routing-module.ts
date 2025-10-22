import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchResultsComponent} from "./pages/search-results/search-results.component";
import {ProductDetailsPageComponent} from "./pages/product-details-page/product-details-page.component";
import {ProductEditPageComponent} from "./pages/product-edit-page/product-edit-page.component";
import {authGuard} from "../auth/guards/auth.guard";
import {HomePageComponent} from "./pages/home-page/home-page.component";

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'search-results', component: SearchResultsComponent},
  {path: 'product/:id', component: ProductDetailsPageComponent},
  {path: 'product/edit/:id', component: ProductEditPageComponent, canActivate: [authGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule {
}
