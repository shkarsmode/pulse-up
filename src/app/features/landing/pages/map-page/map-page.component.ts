import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Projection } from "mapbox-gl";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { IMapMarker } from "@/app/shared/interfaces/map/map-marker.interface";
import { SwitchComponent } from "@/app/shared/components/ui-kit/switch/switch/switch.component";
import { MercatorMapComponent } from "./components/mercator-map/mercator-map.component";
import { GlobeMapComponent } from "./components/globe-map/globe-map.component";
import { CategoryFilterMenuComponent } from "@/app/shared/components/category-filter-menu/category-filter-menu.component";
import { MapMarkersService } from "@/app/shared/services/map/map-marker.service";
import { CategoryFilterSelectionComponent } from "@/app/shared/components/category-filter-menu/category-filter-selection/category-filter-selection.component";
import { MapPageService } from "./map-page.service";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { MapInfoButtonComponent } from "../../ui/map-info-button/map-info-button.component";

@Component({
    selector: "app-map-page",
    templateUrl: "./map-page.component.html",
    styleUrl: "./map-page.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        SwitchComponent,
        MercatorMapComponent,
        GlobeMapComponent,
        CategoryFilterMenuComponent,
        CategoryFilterSelectionComponent,
        MapInfoButtonComponent,
    ],
})
export class MapPageComponent implements OnInit, OnDestroy {
    private router: Router = inject(Router);
    private mapMarkersService = inject(MapMarkersService);
    private mapPageService = inject(MapPageService);
    private mediaService = inject(MediaQueryService);

    private topicCategories = toSignal(this.mapPageService.topicCategories$, { initialValue: [] });

    public projection: Projection["name"] = "mercator";
    public switchClasses = {};
    public isProjectionToogleVisible = true;
    public filterOptions$ = this.mapPageService.filterCategories$;
    public selectedCategory$ = this.mapPageService.selectedCategory$;
    public isNewestCategorySelected$ = this.selectedCategory$.pipe(
        map((category) => category === "newest"),
    );

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

    ngOnDestroy(): void {
        this.mapMarkersService.category = null;
        this.mapMarkersService.clearMarkers();
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

    public onSelectedCategory(category: string): void {
        this.mapPageService.setSelectedCategory(category);
        const topicCategory = this.topicCategories().find(({ name }) => name === category);
        this.mapMarkersService.category = topicCategory || null;
    }
}
