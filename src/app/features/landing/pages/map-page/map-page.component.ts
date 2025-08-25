import { Component, inject, OnInit, OnDestroy, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Projection } from "mapbox-gl";
import { IMapMarker } from "@/app/shared/interfaces/map/map-marker.interface";
import { SwitchComponent } from "@/app/shared/components/ui-kit/switch/switch/switch.component";
import { MercatorMapComponent } from "./components/mercator-map/mercator-map.component";
import { GlobeMapComponent } from "./components/globe-map/globe-map.component";
import { MapInfoTipComponent } from "../../ui/map-info-tip/map-info-tooltip.component";
import { CategoryFilterMenuComponent } from "@/app/shared/components/category-filter-menu/category-filter-menu.component";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { MapMarkersService } from "@/app/shared/services/map/map-marker.service";
import { CategoryFilterService } from "@/app/shared/components/category-filter-menu/category-filter.service";
import { CategoryFilterSelectionComponent } from "@/app/shared/components/category-filter-menu/category-filter-selection/category-filter-selection.component";
import { MapPageService } from "./map-page.service";
import {
    LOCAL_STORAGE_KEYS,
    LocalStorageService,
} from "@/app/shared/services/core/local-storage.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";

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
        MapInfoTipComponent,
        CategoryFilterMenuComponent,
        CategoryFilterSelectionComponent,
    ],
})
export class MapPageComponent implements OnInit, OnDestroy {
    private router: Router = inject(Router);
    private mapMarkersService = inject(MapMarkersService);
    private categoryFilterService = inject(CategoryFilterService);
    private mapPageService = inject(MapPageService);
    private mediaService = inject(MediaQueryService);

    public projection: Projection["name"] = "mercator";
    public switchClasses = {};
    public isProjectionToogleVisible = true;
    public selectedCategory$ = this.mapPageService.selectedCategory$;
    public infoTooltipVisible = signal(false);
    public isMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));

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
        const mapInfoTooltipShown =
            LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.mapInfoTooltipShown) || false;
        this.infoTooltipVisible.set(!mapInfoTooltipShown);
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

    public onSelectedCategory(category: ICategory | null): void {
        this.mapPageService.setSelectedCategory(category);
        this.mapMarkersService.category = category;
        this.categoryFilterService.activeCategory = category || "all";
    }

    public hideInfoTooltip() {
        this.infoTooltipVisible.set(false);
    }
}
