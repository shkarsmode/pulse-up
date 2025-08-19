import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { filter, map } from "rxjs";
import { LinkifyPipe } from "@/app/shared/pipes/linkify.pipe";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { UserAvatarComponent } from "@/app/features/landing/ui/user-avatar/user-avatar.component";
import { FabButtonComponent } from "@/app/shared/components/ui-kit/buttons/fab-button/fab-button.component";

@Component({
    selector: "app-profile-card",
    standalone: true,
    imports: [
        CommonModule,
        UserAvatarComponent,
        LinkifyPipe,
        AngularSvgIconModule,
        FabButtonComponent,
    ],
    templateUrl: "./profile-card.component.html",
    styleUrl: "./profile-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
    private readonly profileService = inject(ProfileService);

    private profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    public bio$ = this.profile$.pipe(map((profile) => profile.bio));
    public name$ = this.profile$.pipe(map((profile) => profile.name));
    public username$ = this.profile$.pipe(map((profile) => profile.username));
    public picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
}
