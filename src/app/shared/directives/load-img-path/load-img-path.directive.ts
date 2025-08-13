import {
    AfterViewInit,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    OnInit,
    Renderer2,
} from "@angular/core";
import { SettingsService } from "../../services/api/settings.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Directive({
    selector: "[appLoadImgPath]",
    standalone: true,
})
export class LoadImgPathDirective implements OnInit, AfterViewInit {
    private hasPathUpdated = false;

    private readonly destroyRef = inject(DestroyRef);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly elementRef: ElementRef<HTMLImageElement> = inject(ElementRef);

    private readonly renderer: Renderer2 = inject(Renderer2);

    public ngOnInit(): void {
        this.setPrefixPathForElement();
        this.elementRef.nativeElement.classList.add("img-loading");
    }

    public ngAfterViewInit() {
        this.initImgCompleteLoadingListener();
    }

    private initImgCompleteLoadingListener(): void {
        this.elementRef.nativeElement.style.opacity = "0";
        this.elementRef.nativeElement.style.transition = "all .3s";

        this.renderer.listen(this.elementRef.nativeElement, "load", () => {
            this.elementRef.nativeElement.style.opacity = "1";
        });
    }

    private setPrefixPathForElement(): void {
        if (this.hasPathUpdated) return;

        this.settingsService.settings$
            .pipe(
                map((settings) => settings.blobUrlPrefix),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((prefix) => {
                const fullSrc = this.elementRef.nativeElement.src;

                const src = new URL(fullSrc).pathname;

                this.elementRef.nativeElement.src = prefix + src;

                this.hasPathUpdated = true;
            });
    }
}
