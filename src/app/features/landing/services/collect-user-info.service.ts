import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { first, take } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class CollectUserInfoService {
    private readonly dialog = inject(MatDialog);
    private readonly profileService = inject(ProfileService);
    private readonly router = inject(Router);

    private isOpened = false;

    public collectPersonalInfo(): void {
        // const accountsIds =
        //     LocalStorageService.get<string[]>(
        //         LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles,
        //     ) || [];

        this.profileService.profile$.pipe(first((profile) => !!profile)).subscribe((profile) => {
            if (!profile?.id) return;
            // const alreadyShown = accountsIds && accountsIds.includes(profile.id);

            if (
                !this.isOpened &&
                profile &&
                (!profile.name || !profile.username)
            ) {
                this.openDialog();
                // LocalStorageService.set(LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles, [
                //     ...accountsIds,
                //     profile.id,
                // ]);
            }
        });
    }

    private async openDialog(): Promise<void> {
        const PersonalInfoPopupComponent = await import(
            "../ui/personal-info-popup/personal-info-popup.component"
        ).then((module) => module.PersonalInfoPopupComponent);
        this.isOpened = true;
        const dialogRef = this.dialog.open(PersonalInfoPopupComponent, {
            width: "500px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((profile) => {
                if (!profile) {
                    this.router.navigateByUrl('/topics');
                    return;
                }
                this.isOpened = false;
            });
    }
}
