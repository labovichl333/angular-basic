import {Component, inject, Input} from '@angular/core';
import {Product} from "../../models/product.model";
import {CartService} from "../../../cart/services/cart.service";

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss'
})
export class AddToCartComponent {
  @Input({required: true}) product!: Product;

  cartService = inject(CartService)
}
