import { Directive, ElementRef, inject, Renderer2 } from "@angular/core";

@Directive({
    selector: "[appVawesAnimation]",
    standalone: true,
})
export class WaveAnimationDirective {
    private readonly _renderer: Renderer2 = inject(Renderer2);
    private readonly _elementRef: ElementRef = inject(ElementRef);
    constructor() {
        this._renderer.addClass(this._elementRef.nativeElement, "wave-animation");
    }
}
