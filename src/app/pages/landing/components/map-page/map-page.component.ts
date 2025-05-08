import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Projection } from "mapbox-gl";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";

@Component({
    selector: "app-map-page",
    templateUrl: "./map-page.component.html",
    styleUrl: "./map-page.component.scss",
})
export class MapPageComponent {
    private router: Router = inject(Router);

    public projection: Projection["name"] = "mercator";
    public switchClasses = {};
    public isProjectionToogleVisible = true;

    ngOnInit() {
        this.switchClasses = {
            "map-page__switch": true,
            "map-page__switch--contrast": this.projection === 'globe'
        };
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
