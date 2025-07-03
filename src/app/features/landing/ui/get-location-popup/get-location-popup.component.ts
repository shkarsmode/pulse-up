import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogRef } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { delay, map, take } from "rxjs";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-get-location-popup",
    standalone: true,
    imports: [
        CommonModule,
        PopupLayoutComponent,
        PopupTextComponent,
        SpinnerComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
    ],
    templateUrl: "./get-location-popup.component.html",
    styleUrl: "./get-location-popup.component.scss",
})
export class GetLocationPopupComponent {
    private readonly dialogRef = inject(MatDialogRef<GetLocationPopupComponent>);
    private readonly destroyRef = inject(DestroyRef);
    private readonly votingService = inject(VotingService);
    private readonly geolocationService = inject(GeolocationService);

    loading$ = this.geolocationService.status$.pipe(
        takeUntilDestroyed(this.destroyRef),
        map((status) => status === "initial" || status === "pending"),
    );
    isError = false;

    ngOnInit() {
        this.geolocationService
            .getCurrentGeolocation({ enableHighAccuracy: false })
            .pipe(take(1), delay(750)) // Adding a delay to simulate loading time
            .subscribe({
                next: () => {
                    this.isError = false;
                    this.dialogRef.close();
                    setTimeout(() => {
                        this.votingService.signInWithGeolocation();
                    }, 250)
                },
                error: () => {
                    this.isError = true;
                },
            });
    }

    proceed() {
        this.dialogRef.close();
        setTimeout(() => {
            this.votingService.signInWithoutGeolocation();
        }, 250);
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
