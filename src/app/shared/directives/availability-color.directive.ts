import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appAvailabilityColor]'
})
export class AvailabilityColorDirective implements OnInit {

  @Input() appAvailabilityColor!: number;

  constructor(private el: ElementRef) {
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

    this.el.nativeElement.style.color = color;
    this.el.nativeElement.style.fontWeight = 'bold';
  }
}
