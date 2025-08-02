import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import Splide, { Options } from '@splidejs/splide';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.scss',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
})
export class SliderComponent implements OnInit, OnDestroy {
    @ViewChild('contentWrapper', { static: true }) public contentWrapper: ElementRef;
    @ViewChild('splide', { static: true }) public splide: ElementRef;

    public splideInstance: Splide;
    
    private mutationObserver: MutationObserver;
    private options: Options = {
        arrows: false,
        pagination: true,
        perPage: 1,
    };

    public ngOnInit(): void {
        this.mountSplideWithOptions();
        this.initObserveNgContentChanges();
    }

    private initObserveNgContentChanges(): void {
        this.mutationObserver = new MutationObserver((mutations) => 
            mutations.forEach((mutation) => 
                mutation.type === 'childList' &&
                    this.refreshSplideInstance()
            )
        )

        if (this.contentWrapper) {
            this.mutationObserver.observe(this.contentWrapper.nativeElement, {
                childList: true,
                subtree: true
            });
        }
    }

    private refreshSplideInstance(): void {
        if (this.splideInstance) {
            this.splideInstance.refresh();
        }
    }

    private mountSplideWithOptions(): void {
        this.splideInstance = new Splide(
            this.splide.nativeElement,
            this.options
        ).mount();
    }

    public goToPrev(): void {
        if (this.splideInstance) {
            this.splideInstance.go('<');
        }
    }

    public goToNext(): void {
        if (this.splideInstance) {
            this.splideInstance.go('>');
        }
    }

    public ngOnDestroy(): void {
        this.mutationObserver.disconnect();
        if (this.splideInstance) {
            this.splideInstance.destroy();
        }
    }
}
