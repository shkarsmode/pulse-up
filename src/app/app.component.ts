import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MetadataService } from "./shared/services/core/metadata.service";
import { environment } from "@/environments/environment";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
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
