import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[heartBeatAnimation]',
  standalone: true
})
export class HeartBeatDirective implements OnInit {
    @Input() isBlink: boolean = false;
    @Input() delay: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Add the 'heart-beat' class to the element
    if(this.isBlink) {
        this.renderer.addClass(this.el.nativeElement, 'heart-beat-advanced');
    } else {
        this.renderer.addClass(this.el.nativeElement, 'heart-beat');
    }

    if (this.delay) {
        this.renderer.setStyle(this.el.nativeElement, 'animation-delay', `${this.delay}ms`);
    }
  }
}
