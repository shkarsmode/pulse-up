import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [CloseButtonComponent, PrimaryButtonComponent],
    templateUrl: "./topic-published.component.html",
    styleUrl: "./topic-published.component.scss",
})
export class TopicPublishedComponent {
    private readonly dialogRef: MatDialogRef<TopicPublishedComponent> = inject(MatDialogRef);
    private readonly pulseService: PulseService = inject(PulseService);

    public onCloseDialog(): void {
        this.dialogRef.close();
        this.pulseService.isJustCreatedTopic = false;
    }

    public copyLink(): void {}
}
