import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { ProfileFormComponent } from "../../ui/profile-form/profile-form.component";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { ProfileHeaderComponent } from "../../ui/profile-header/profile-header.component";
import { MaterialModule } from "@/app/shared/modules/material.module";

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
        MaterialModule,
    ],
    templateUrl: "./edit-profile.component.html",
    styleUrl: "./edit-profile.component.scss",
})
export class EditProfileComponent implements OnInit {
    private readonly destroyed = inject(DestroyRef);
    public readonly profileService = inject(ProfileService);
    public isLoading = true;

    public profileFormvalues = {
        name: "",
        username: "",
        bio: "",
        picture: null as string | null,
    };

    ngOnInit() {
        this.profileService.profile$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe((profile) => {
                if (profile) {
                    this.profileFormvalues.name = profile.name || "";
                    this.profileFormvalues.username = profile.username || "";
                    this.profileFormvalues.bio = profile.bio || "";
                    this.profileFormvalues.picture = profile.picture || null;
                }
                this.isLoading = false;
            });
    }
}
