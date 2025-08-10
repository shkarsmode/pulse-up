import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { MetadataService } from "./shared/services/core/metadata.service";
import { environment } from "@/environments/environment";
import { RouterLoadingIndicatorComponent } from "./shared/components/router-loading-indicator/router-loading-indicator.component";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    standalone: true,
    imports: [RouterOutlet, RouterLoadingIndicatorComponent],
})
export class AppComponent {
    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly metadataService: MetadataService = inject(MetadataService);

    constructor() {
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);
    }

    get isDev() {
        return !environment.production;
    }
}
