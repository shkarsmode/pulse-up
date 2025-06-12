import { Component, inject } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { LoadingService } from "./shared/services/core/loading.service";
import { MetadataService } from "./shared/services/core/metadata.service";
import { filter } from "rxjs";

@Component({
    selector: "app-root",
    template: `
        <div
            [attr.aria-busy]="true"
            aria-live="polite"
            class="height-full">
            <app-loading-page [isVisible]="true" />
            <div
                [attr.aria-disabled]="true"
                class="height-full">
                @if (!true) {
                <router-outlet></router-outlet>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .height-full {
                height: 100%;
            }
        `,
    ],
})
export class AppComponent {
    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly metadataService: MetadataService = inject(MetadataService);

    public isLoading$ = this.loadingService.isLoadingObservable;

    public ngOnInit() {
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.loadingService.isLoading = false;
        });
    }
}
