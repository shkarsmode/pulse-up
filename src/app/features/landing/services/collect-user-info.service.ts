import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { first, take } from "rxjs";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { PersonalInfoPopupComponent } from "../ui/personal-info-popup/personal-info-popup.component";

@Injectable({
    providedIn: "root",
})
export class CollectUserInfoService {
    private readonly dialog = inject(MatDialog);
    private readonly profileService = inject(ProfileService);

    private isOpened = false;

    public collectPersonalInfo(): void {
        const currentUrl = window.location.pathname;
        const accountsIds =
            LocalStorageService.get<string[]>(LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles) || [];
        this.profileService.profile$.pipe(first((profile) => !!profile)).subscribe((profile) => {
            if (!profile?.id) return;
            const alreadyShown = accountsIds && accountsIds.includes(profile.id);
            if (
                !this.isOpened &&
                !alreadyShown &&
                currentUrl === "/" &&
                profile &&
                (!profile.name || !profile.username)
            ) {
                this.openDialog();
                LocalStorageService.set(LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles, [
                    ...accountsIds,
                    profile.id,
                ]);
            }
        });
    }

    private openDialog(): void {
        this.isOpened = true;
        const dialogRef = this.dialog.open(PersonalInfoPopupComponent, {
            width: "500px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => {
                this.isOpened = false;
            });
    }
}
