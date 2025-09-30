import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { ProfileFormComponent } from "../../ui/profile-form/profile-form.component";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { ProfileHeaderComponent } from "../../ui/profile-header/profile-header.component";

@Component({
    selector: "app-edit-profile",
    standalone: true,
    imports: [
        CommonModule,
        ProfileFormComponent,
        ProfileLayoutComponent,
        ProfileHeaderComponent,
        AngularSvgIconModule,
        MatMenuModule,
        MatButtonModule,
    ],
    templateUrl: "./edit-profile.component.html",
    styleUrl: "./edit-profile.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileComponent {
    private profileService = inject(ProfileService);

    private readonly initislValues = {
        name: "",
        username: "",
        bio: "",
        picture: null as string | null,
    };

    public profile = this.profileService.profile;
    public isLoading = computed(() => {
        const profile = this.profileService.profile();
        return profile === null;
    });
    public profileFormValues = computed(() => {
        const profile = this.profileService.profile();
        return {
            name: profile?.name || this.initislValues.name,
            username: profile?.username || this.initislValues.username,
            bio: profile?.bio || this.initislValues.bio,
            picture: profile?.picture || this.initislValues.picture,
        };
    });
}
