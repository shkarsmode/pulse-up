import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { UserStore } from '@/app/shared/stores/user.store';
import { AuthenticationService } from '@/app/shared/services/api/authentication.service';

@Component({
    selector: 'app-promote-ads',
    templateUrl: './promote-ads.component.html',
    styleUrl: './promote-ads.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, PrimaryButtonComponent, RouterModule],
})
export class PromoteAdsComponent {
    private readonly router: Router = inject(Router);
    private readonly userStore: UserStore = inject(UserStore);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    public readonly isAuthenticated$ = this.authenticationService.userToken;
    public readonly isProfileComplete$ = this.userStore.profile$.pipe(
        map(profile => !!profile?.name && !!profile?.username)
    );
    public signInRoute = "/" + AppRoutes.Auth.SIGN_IN;

    public onAddTopicClick(): void {
        this.router.navigateByUrl('/' + AppRoutes.User.Topic.SUGGEST);
    }
}
