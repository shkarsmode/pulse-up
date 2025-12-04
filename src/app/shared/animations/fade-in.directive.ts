import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { WINDOW } from '../tokens/window.token';

@Directive({
    selector: '[fadeIn]',
    standalone: true,
})
export class FadeInDirective implements AfterViewInit { 
    @Input() childrenFadeIn = false;
    private isWin = inject(WINDOW);

    constructor(
        private el: ElementRef,
    ) {}

    ngAfterViewInit(): void {
        if (!this.isWin) return;
        if(this.childrenFadeIn) this.fadeInChildren()
        else this.fadeIn()
    }

    private fadeIn() {
        const element = this.el.nativeElement as HTMLElement;

        element.classList.add('fade-in');
    }

    
    private fadeInChildren() {
        const children = this.el.nativeElement.children as HTMLCollection;

        const elementsList = Object.values(children);
        
        elementsList.map((element, i) => {
            const e = element as HTMLElement;
            element.classList.add('fade-in');
        })        
        
    }


}