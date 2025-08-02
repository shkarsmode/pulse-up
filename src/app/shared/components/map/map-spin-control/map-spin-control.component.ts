import { Component, Input, OnInit } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";
import { GlobeSpinnerService } from "@/app/features/landing/services/globe-spinner.service";
import mapboxgl from "mapbox-gl";

@Component({
    selector: "app-map-spin-control",
    standalone: true,
    imports: [SvgIconComponent],
    templateUrl: "./map-spin-control.component.html",
    styleUrl: "./map-spin-control.component.scss",
})
export class MapSpinControlComponent implements OnInit {
    private readonly globeSpinnerService = new GlobeSpinnerService();

    @Input() map: mapboxgl.Map;
    @Input() spinning = false;
    @Input() isSpinEnabled = false;

    public isSpinButtonVisible = this.isSpinEnabled;
    public get isSpinning() {
        return this.globeSpinnerService.spinning;
    }

    ngOnInit(): void {
        this.initGlobeSpinner();
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
    };
}
