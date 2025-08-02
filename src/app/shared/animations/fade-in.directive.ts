import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[fadeIn]',
    standalone: true,
})
export class FadeInDirective implements AfterViewInit { 
    @Input() childrenFadeIn = false;

    constructor(
        private el: ElementRef,
    ) {}

    ngAfterViewInit(): void {
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