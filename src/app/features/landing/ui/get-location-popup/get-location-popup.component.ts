import { GetAppButtonComponent } from "@/app/shared/components/ui-kit/buttons/get-app-button/get-app-button.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialogRef } from "@angular/material/dialog";
import {
  catchError,
  delay,
  dematerialize,
  map,
  materialize,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

@Component({
  selector: "app-get-location-popup",
  standalone: true,
  imports: [
    CommonModule,
    PopupLayoutComponent,
    PopupTextComponent,
    SpinnerComponent,
    PopupFooterComponent,
    GetAppButtonComponent,
    PopupTitleComponent,
    PopupCloseButtonComponent,
    PrimaryButtonComponent,
  ],
  templateUrl: "./get-location-popup.component.html",
  styleUrl: "./get-location-popup.component.scss",
})
export class GetLocationPopupComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<GetLocationPopupComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly votingService = inject(VotingService);
  private readonly geolocationService = inject(GeolocationService);

  loading$ = this.geolocationService.status$.pipe(
    map((status) => status === "initial" || status === "pending"),
    takeUntilDestroyed(this.destroyRef),
  );
  isError = false;

  ngOnInit() {
    this.getCurrentGeolocation();
  }

  proceed() {
    this.dialogRef.close();
    this.dialogRef
      .afterClosed()
      .pipe(delay(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.votingService.signInWithoutGeolocation();
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getCurrentGeolocation() {
    this.isError = false;
    this.geolocationService.getCurrentGeolocation().pipe(
      materialize(),
      take(1),
      delay(750),
      dematerialize(), // Adding a delay to simulate loading time
      tap(() => this.dialogRef.close()),
      switchMap(() =>
        this.dialogRef.afterClosed().pipe(
          delay(250),
          takeUntilDestroyed(this.destroyRef),
          tap(() => this.votingService.signInWithGeolocation()),
        ),
      ),
      catchError((error: unknown) => {
        this.isError = true;
        return throwError(() => error);
      }),
    );
  }
}
