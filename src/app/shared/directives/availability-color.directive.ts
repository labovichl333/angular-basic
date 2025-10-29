import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appAvailabilityColor]'
})
export class AvailabilityColorDirective implements OnInit {

  @Input() appAvailabilityColor!: number;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
  }

  ngOnInit(): void {
    const stock = this.appAvailabilityColor;

    let color = '';
    if (stock > 10) {
      color = '#4CAF50';
    } else if (stock > 0) {
      color = '#FF9800';
    } else {
      color = '#f44336';
    }

    this.renderer.setStyle(this.el.nativeElement, 'color', color);
    this.renderer.setStyle(this.el.nativeElement, 'font-weight', 'bold')
  }
}
