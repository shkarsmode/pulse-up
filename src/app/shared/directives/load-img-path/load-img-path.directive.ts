import { AfterViewInit, Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { SettingsService } from '../../services/api/settings.service';

@Directive({
    selector: '[appLoadImgPath]',
    standalone: true,
})
export class LoadImgPathDirective implements OnInit, AfterViewInit {
    private hasPathUpdated = false;

    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly elementRef: ElementRef<HTMLImageElement> =
        inject(ElementRef);

    private readonly renderer: Renderer2 = inject(Renderer2);

    public ngOnInit(): void {
        this.setPrefixPathForElement();
        this.elementRef.nativeElement.classList.add('img-loading');
    }

    public ngAfterViewInit() {
        this.initImgCompleteLoadingListener();
    }

    private initImgCompleteLoadingListener(): void {
        this.elementRef.nativeElement.style.opacity = '0';
        this.elementRef.nativeElement.style.transition = 'all .3s';

        this.renderer.listen(this.elementRef.nativeElement, 'load', () => {
            this.elementRef.nativeElement.style.opacity = '1';
        });
    }

    private setPrefixPathForElement(): void {
        if (this.hasPathUpdated) return;

        const prefix = this.settingsService.blobUrlPrefix;
        const fullSrc = this.elementRef.nativeElement.src;
        
        const src = new URL(fullSrc).pathname;
        
        this.elementRef.nativeElement.src = prefix + src;
        
        this.hasPathUpdated = true;
    }
}
