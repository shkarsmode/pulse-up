import { environment } from "@/environments/environment";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { DevMenuComponent } from "./shared/components/dev-menu/dev-menu.component";
import { RouterLoadingIndicatorComponent } from "./shared/components/router-loading-indicator/router-loading-indicator.component";
import { RouterLoadingIndicatorService } from './shared/components/router-loading-indicator/router-loading-indicator.service';
import { DevSettingsService } from "./shared/services/core/dev-settings.service";
import { MetadataService } from "./shared/services/core/metadata.service";
import { ProfileService } from './shared/services/profile/profile.service';

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    standalone: true,
    imports: [RouterOutlet, RouterLoadingIndicatorComponent, DevMenuComponent],
})
export class AppComponent {
    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly metadataService: MetadataService = inject(MetadataService);
    public profileService = inject(ProfileService);
    public devSettings = inject(DevSettingsService);
    private routerLoadingIndicatorService = inject(RouterLoadingIndicatorService);

    constructor() {
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);
        setTimeout(() => {
            this.routerLoadingIndicatorService.setLoading(false);
        }, 1000);
    }

    get isDev() {
        return !environment.production;
    }
}
