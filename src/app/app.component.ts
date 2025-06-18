import { Component, inject } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { LoadingService } from "./shared/services/core/loading.service";
import { MetadataService } from "./shared/services/core/metadata.service";

@Component({
    selector: "app-root",
    template: `
        <div
            [attr.aria-busy]="isLoading$ | async"
            aria-live="polite"
            class="height-full">
            <app-loading-page [isVisible]="(isLoading$ | async) || false" />
            <div
                [attr.aria-disabled]="isLoading$ | async"
                class="height-full">
                @if (!(isLoading$ | async)) {
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

    constructor() {
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);

        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.loadingService.isLoading = false;
            });
    }
}
