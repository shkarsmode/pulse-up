import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Projection } from "mapbox-gl";
import { IMapMarker } from "@/app/shared/interfaces/map/map-marker.interface";
import { SwitchComponent } from "@/app/shared/components/ui-kit/switch/switch/switch.component";
import { MercatorMapComponent } from "./components/mercator-map/mercator-map.component";
import { GlobeMapComponent } from "./components/globe-map/globe-map.component";

@Component({
    selector: "app-map-page",
    templateUrl: "./map-page.component.html",
    styleUrl: "./map-page.component.scss",
    standalone: true,
    imports: [CommonModule, SwitchComponent, MercatorMapComponent, GlobeMapComponent],
})
export class MapPageComponent implements OnInit {
    private readonly router: Router = inject(Router);

    public projection: Projection["name"] = "mercator";
    public switchClasses = {};
    public isProjectionToogleVisible = true;

    get isGlobe() {
        return this.projection === "globe";
    }

    get switchColor() {
        return this.isGlobe ? "#FFFFFF" : "#000000";
    }

    ngOnInit() {
        this.switchClasses = {
            "map-page__switch": true,
            "map-page__switch--contrast": this.projection === "globe",
        };
    }

    public onMarkerClick(marker: IMapMarker) {
        this.router.navigate([`topic/${marker.topicId}`]);
    }

    public onSwitchChange(checked: boolean) {
        this.projection = checked ? "globe" : "mercator";
    }

    public onZoomEnd(zoom: number) {
        this.isProjectionToogleVisible = zoom >= 4 ? false : true;
    }
}
