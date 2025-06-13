import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { filter, map } from "rxjs";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { UserStore } from "@/app/shared/stores/user.store";
import { UserAvatarComponent } from "../../../landing/pages/user/components/user-avatar/user-avatar.component";
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { RouterModule } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SecondaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
    CommonModule,
    RouterModule,
    UserAvatarComponent,
    ContainerComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent
],
    templateUrl: "./review-profile.component.html",
    styleUrl: "./review-profile.component.scss",
})
export class ReviewProfileComponent {
    private userStore = inject(UserStore);

    profile$ = this.userStore.profile$.pipe(filter((profile) => !!profile));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    username$ = this.profile$.pipe(map((profile) => profile.username));
    picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    editRpofileRoute = "/" + AppRoutes.Profile.EDIT;
}
