import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Projection } from "mapbox-gl";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { SwitchComponent } from "@/app/shared/components/ui-kit/switch/switch/switch.component";
import { GlobeMapComponent } from "./components/globe-map/globe-map.component";
import { MercatorMapComponent } from "./components/mercator-map/mercator-map.component";

@Component({
    selector: "app-map-page",
    templateUrl: "./map-page.component.html",
    styleUrl: "./map-page.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        SwitchComponent,
        GlobeMapComponent,
        MercatorMapComponent,
    ],
})
export class MapPageComponent {
    private router: Router = inject(Router);

    public projection: Projection["name"] = "globe";
    public switchClasses = {};
    public isProjectionToogleVisible = true;

    ngOnInit() {
        this.switchClasses = {
            "map-page__switch": true,
            "map-page__switch--contrast": this.projection === 'globe'
        };
    }

    get isGlobe() {
        return this.projection === "globe";
    }

    get switchColor() {
        return this.isGlobe ? "#FFFFFF" : "#000000";
    }

    public onMarkerClick(marker: IMapMarker) {
        let newRelativeUrl = this.router.createUrlTree([`topic/${marker.topicId}`]);
        let baseUrl = window.location.href.replace(this.router.url, "");
        window.open(baseUrl + newRelativeUrl, "_blank");
    }

    public onSwitchChange(checked: boolean) {
        this.projection = checked ? "globe" : "mercator";
    }

    public onZoomEnd(zoom: number) {
        this.isProjectionToogleVisible = zoom >= 4 ? false : true;
    }
}
