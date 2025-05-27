import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { UserStore } from "../../stores/user.store";
import { PersonalInfoPopupComponent } from "../../components/popups/personal-info-popup/personal-info-popup.component";

@Injectable({
  providedIn: "root",
})
export class CollectUserInfoService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly userStore: UserStore = inject(UserStore);

  private isOpened = false;

  public collectPersonalInfo(): void {
    this.userStore.fetchOwnProfile();
    this.userStore.profile$.subscribe((profile) => {
      if (!this.isOpened && profile && (!profile.name || !profile.username)) {
        this.openDialog();
      }
    })
  }

  private openDialog(): void {
    this.isOpened = true;
    this.dialog.open(PersonalInfoPopupComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
      disableClose: true,
    });
  }
}