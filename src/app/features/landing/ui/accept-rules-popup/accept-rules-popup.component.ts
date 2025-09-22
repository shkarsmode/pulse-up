import { Component, inject, signal } from "@angular/core";
import {
    delay,
    dematerialize,
    firstValueFrom,
    from,
    materialize,
    Subscription,
    take,
    tap,
} from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { VotingService } from "@/app/shared/services/votes/voting.service";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { GetAppButtonComponent } from "@/app/shared/components/ui-kit/buttons/get-app-button/get-app-button.component";

@Component({
    selector: "app-accept-rules-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupTextComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
        PopupTitleComponent,
        SpinnerComponent,
        GetAppButtonComponent,
    ],
    templateUrl: "./accept-rules-popup.component.html",
    styleUrl: "./accept-rules-popup.component.scss",
})
export class AcceptRulesPopupComponent {
    private readonly dialogRef = inject(MatDialogRef<AcceptRulesPopupComponent>);
    private readonly votingService = inject(VotingService);
    private readonly geolocationService = inject(GeolocationService);

    private subscription: Subscription;

    public isLoading = signal(false);
    public isError = signal(false);

    ngOnDestrtoy() {
        this.subscription?.unsubscribe();
    }

    onClose() {
        this.dialogRef.close();
    }

    async onAccept() {
        try {
            this.isLoading.set(true);
            await this.geolocationService.getCurrentGeolocationAsync();
            this.subscription = this.dialogRef
                .afterClosed()
                .pipe(take(1), delay(250))
                .subscribe(() => {
                    this.votingService.signInWithGeolocation();
                });
            this.dialogRef.close();
        } catch {
            this.isError.set(true);
            this.isLoading.set(false);
        }
    }

    async retry() {
        this.isError.set(false);
        this.isLoading.set(true);
        try {
            await firstValueFrom(
                from(this.geolocationService.getCurrentGeolocationAsync()).pipe(
                    materialize(),
                    take(1),
                    delay(500),
                    dematerialize(),
                    tap(() => {
                        this.dialogRef.close();
                        this.votingService.signInWithGeolocation();
                        this.isLoading.set(false);
                    }),
                ),
            );
        } catch {
            this.isError.set(true);
            this.isLoading.set(false);
        }
    }
}
