import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileFormComponent } from "../../ui/profile-form/profile-form.component";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

@Component({
    selector: "app-edit-profile",
    standalone: true,
    imports: [CommonModule, ProfileFormComponent, ProfileLayoutComponent],
    templateUrl: "./edit-profile.component.html",
    styleUrl: "./edit-profile.component.scss",
})
export class EditProfileComponent {
    private readonly destroyed = inject(DestroyRef);
    public readonly profileService = inject(ProfileService);
    public isLoading: boolean = true;

    public profileFormvalues = {
        name: "",
        username: "",
        bio: "",
        picture: null as string | null,
    };

    ngOnInit() {
        this.profileService.profile$.pipe(takeUntilDestroyed(this.destroyed)).subscribe((profile) => {
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
