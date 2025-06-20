import { Component, DestroyRef, inject } from "@angular/core";
import { ProfileFormComponent } from "../../ui/profile-form/profile-form.component";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProfileStore } from "@/app/shared/stores/profile.store";

@Component({
    selector: "app-edit-profile",
    standalone: true,
    imports: [ProfileFormComponent, ProfileLayoutComponent],
    templateUrl: "./edit-profile.component.html",
    styleUrl: "./edit-profile.component.scss",
})
export class EditProfileComponent {
    private readonly destroyed = inject(DestroyRef);
    private readonly profileStore = inject(ProfileStore);
    public isLoading: boolean = true;

    public profileFormvalues = {
        name: "",
        username: "",
        bio: "",
        picture: null as string | null,
    };

    ngOnInit() {
        this.profileStore.profile$.pipe(takeUntilDestroyed(this.destroyed)).subscribe((profile) => {
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
