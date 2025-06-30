import { Component, Input } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";
import { GlobeSpinnerService } from "@/app/features/landing/services/globe-spinner.service";
import mapboxgl from "mapbox-gl";

@Component({
    selector: "app-map-globe-layer",
    standalone: true,
    imports: [SvgIconComponent],
    templateUrl: "./map-globe-layer.component.html",
    styleUrl: "./map-globe-layer.component.scss",
})
export class MapGlobeLayerComponent {
    private readonly globeSpinnerService = new GlobeSpinnerService();

    @Input() map: mapboxgl.Map;
    @Input() spinning: boolean = false;
    @Input() isSpinEnabled: boolean = false;

    isSpinning = this.globeSpinnerService.spinning;
    isSpinButtonVisible = this.isSpinEnabled;

    ngOnInit(): void {
        this.map.on("load", this.initGlobeSpinner);
        this.map.on("zoomend", this.updateSpinButtonVisibility);
        this.map.on("moveend", this.updateSpinButtonVisibility);
    }

    public onSpinClick(): void {
        this.globeSpinnerService.toggle();
    }

    private initGlobeSpinner = () => {
        this.globeSpinnerService.init(this.map);

        if (this.spinning) {
            this.globeSpinnerService.start();
        }
    };
    private updateSpinButtonVisibility = () => {
        if (!this.isSpinEnabled) {
            this.isSpinButtonVisible = false;
            return;
        }
        if (this.map.getZoom() <= this.globeSpinnerService.maxSpinZoom) {
            this.isSpinButtonVisible = true;
        } else {
            this.isSpinButtonVisible = false;
        }
    }
}
