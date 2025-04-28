import { Component, inject } from '@angular/core';
import { combineLatest, take } from 'rxjs';
import { AuthenticationService } from './shared/services/api/authentication.service';
import { PulseService } from './shared/services/api/pulse.service';
import { LoadingService } from './shared/services/core/loading.service';
import { MetadataService } from './shared/services/core/metadata.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    template: `
        @if (isLoading) { 
            <app-loading-page />

        } @else {
            <router-outlet></router-outlet>
        }
    `,
})
export class AppComponent {
    public isLoading: boolean = false;
    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly authenticationService: AuthenticationService = inject(
        AuthenticationService
    );
    private readonly pulseService: PulseService = inject(
        PulseService
    );
    private readonly loadingService: LoadingService = inject( LoadingService);
    private readonly metadataService: MetadataService = inject(MetadataService);

    public ngOnInit() {
        this.sendInitialQueries();
        this.metadataService.listenToRouteChanges(this.router, this.activatedRoute);
    }

    private sendInitialQueries(): void {
        this.isLoading = true;
        this.loadingService.isLoading = true;

        const anonymousUser$ = this.authenticationService.loginAsAnonymousThroughTheFirebase();
        const settings$ = this.pulseService.getSettings();

        combineLatest([anonymousUser$, settings$])
            .pipe(take(1))
            .subscribe((_) => {
                setTimeout(() => { 
                    // this.loadingService.isLoading = false;
                    this.isLoading = false;
                    // setTimeout(() => {
                    //     this.isLoading = false
                    // }, 1000);

                }, 1000);
                
            });
    }
}
