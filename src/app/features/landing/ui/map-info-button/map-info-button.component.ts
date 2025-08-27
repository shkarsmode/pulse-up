import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { toSignal } from "@angular/core/rxjs-interop";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { PopoverComponent } from "@/app/shared/components/popover/popover.component";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { MapInfoTipComponent } from "../map-info-tip/map-info-tooltip.component";
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "@/app/shared/services/core/local-storage.service";

@Component({
    selector: "app-map-info-button",
    standalone: true,
    imports: [AngularSvgIconModule, FlatButtonDirective, PopoverComponent, MapInfoTipComponent],
    templateUrl: "./map-info-button.component.html",
    styleUrl: "./map-info-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapInfoButtonComponent implements OnInit {
    private mediaService = inject(MediaQueryService);

    public isMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));

    public tooltipVisible = false;

    ngOnInit() {
        const isClosed = LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.mapInfoTooltipClosed);
        if (!isClosed) {
            this.openPopover();
        }
    }

    public openPopover() {
        this.tooltipVisible = true;
    }

    public closePopover() {
        this.tooltipVisible = false;
        LocalStorageService.set(LOCAL_STORAGE_KEYS.mapInfoTooltipClosed, true);
    }

    public onTooltipVisibilityChange(visible: boolean) {
        this.tooltipVisible = visible;
    }
}
