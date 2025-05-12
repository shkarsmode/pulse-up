import { Component, inject } from "@angular/core";
import { combineLatest, take } from "rxjs";
import { AuthenticationService } from "./shared/services/api/authentication.service";
import { LoadingService } from "./shared/services/core/loading.service";
import { MetadataService } from "./shared/services/core/metadata.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "./shared/services/api/settings.service";

@Component({
    selector: "app-root",
    template: `
        <div
            [attr.aria-busy]="isLoading"
            aria-live="polite"
            class="height-full">
            <app-loading-page [isVisible]="isLoading" />
            <div
                [attr.aria-disabled]="isLoading"
                class="height-full">
                @if (!isLoading) {
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
    public isLoading: boolean = false;
    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly metadataService: MetadataService = inject(MetadataService);
    private readonly settingsService: SettingsService = inject(SettingsService);

    public ngOnInit() {
        this.sendInitialQueries();
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);
    }

    private sendInitialQueries(): void {
        this.isLoading = true;
        // this.loadingService.isLoading = true;

        const anonymousUser$ = this.authenticationService.loginAsAnonymousThroughTheFirebase();
        const settings$ = this.settingsService.getSettings();

        combineLatest([anonymousUser$, settings$])
            .pipe(take(1))
            .subscribe((_) => {
                // this.isLoading = false;
            });
    }
}
