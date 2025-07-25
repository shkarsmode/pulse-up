import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { filter, map } from "rxjs";
import { UserAvatarComponent } from "../../../landing/ui/user-avatar/user-avatar.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { ProfileTabsComponent } from "../../ui/profile-tabs/profile-tabs.component";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        UserAvatarComponent,
        PrimaryButtonComponent,
        ProfileTabsComponent,
    ],
    templateUrl: "./review-profile.component.html",
    styleUrl: "./review-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class ReviewProfileComponent {
    private readonly profileService = inject(ProfileService);
    profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    bio$ = this.profile$.pipe(map((profile) => profile.bio));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    username$ = this.profile$.pipe(map((profile) => profile.username));
    picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    editProfileRoute = "/" + AppRoutes.Profile.EDIT;
}
