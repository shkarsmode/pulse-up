import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Renderer2,
    AfterViewInit,
    OnInit,
    Output,
    EventEmitter,
} from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import {
    LOCAL_STORAGE_KEYS,
    LocalStorageService,
} from "@/app/shared/services/core/local-storage.service";

@Component({
    selector: "app-map-info-tooltip",
    standalone: true,
    imports: [AngularSvgIconModule, CloseButtonComponent],
    templateUrl: "./map-info-tooltip.component.html",
    styleUrl: "./map-info-tooltip.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapInfoTipComponent implements AfterViewInit, OnInit {
    @Output() closed = new EventEmitter<void>();

    private renderer = inject(Renderer2);
    private elementRef = inject(ElementRef);

    private tooltipShown = false;

    ngOnInit() {
        this.tooltipShown =
            LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.mapInfoTooltipShown) || false;
    }

    ngAfterViewInit() {
        if (this.tooltipShown) return;
        this.showTooltip();
    }

    public onClose() {
        this.hideTooltip();
        setTimeout(() => {
            this.closed.emit();
        }, 200);
    }

    private showTooltip() {
        this.renderer.addClass(this.elementRef.nativeElement, "visible");
    }

    private hideTooltip() {
        this.renderer.removeClass(this.elementRef.nativeElement, "visible");
        LocalStorageService.set<boolean>(LOCAL_STORAGE_KEYS.mapInfoTooltipShown, true);
    }
}
