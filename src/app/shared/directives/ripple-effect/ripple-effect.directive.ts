import {
    Directive,
    ElementRef,
    HostListener,
    inject,
    Input,
    Renderer2,
} from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appRippleEffect]'
})
export class RippleEffectDirective {
    @Input() public unit = 'ms';
    @Input() public animationTime = 600;
    @Input() public enablePreventDefault = false;
    @Input() public animationType = 'ease-in-out';
    @Input() public rippleColor = 'rgba(255, 255, 255, 0.35)';

    private readonly _renderer: Renderer2 = inject(Renderer2);
    private readonly _elementRef: ElementRef = inject(ElementRef);

    constructor() {
        this._renderer.addClass(
            this._elementRef.nativeElement,
            'ripple-effect'
        );
    }

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent): void {
        const { top, left } = this._elementRef.nativeElement.getBoundingClientRect();
        const x = event.clientX - left;
        const y = event.clientY - top;
        const w = this._elementRef.nativeElement.offsetWidth;

        const spanElement: HTMLElement = this._renderer.createElement('span');
        
        this._renderer.appendChild(this._elementRef.nativeElement, spanElement);
        this._renderer.addClass(spanElement, 'ripple-anim');
        this._renderer.setStyle(spanElement, 'top', y + 'px');
        this._renderer.setStyle(spanElement, 'left', x + 'px');
        this._renderer.setStyle(
            spanElement,
            'background-color',
            this.rippleColor
        );
        this._renderer.setStyle(
            spanElement,
            'animation',
            `rippleEffect ${this.animationTime}${this.unit} ${this.animationType}`
        );

        spanElement.style.setProperty('--scale', w.toString());

        setTimeout(() => {
            this._renderer.removeChild(this._elementRef.nativeElement, spanElement);
        }, this.animationTime);
    }
}
