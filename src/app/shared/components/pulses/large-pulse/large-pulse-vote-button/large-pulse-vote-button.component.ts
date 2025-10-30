import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    Input,
    signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ITopic } from "@/app/shared/interfaces";
import { VotingService } from "@/app/shared/services/votes/voting.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SecondaryButtonComponent } from "../../../ui-kit/buttons/secondary-button/secondary-button.component";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";

@Component({
    selector: "app-large-pulse-vote-button",
    standalone: true,
    imports: [SecondaryButtonComponent],
    templateUrl: "./large-pulse-vote-button.component.html",
    styleUrl: "./large-pulse-vote-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargePulseVoteButtonComponent {
    @Input() topic: ITopic | null = null;

    private destroyRef = inject(DestroyRef);
    private votingService = inject(VotingService);
    private notificationService = inject(NotificationService);

    public isInProgress = signal(false);

    public handleClick() {
        if (!this.topic || this.isInProgress()) {
            return;
        }

        this.isInProgress.set(true);

        this.votingService
            .vote({
                topic: this.topic,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.isInProgress.set(false);
                },
                error: (error: unknown) => {
                    console.log(error);
                    this.isInProgress.set(false);
                    let errorMessage = "Failed to pulse. Please try again.";
                    if (isErrorWithMessage(error)) {
                        errorMessage = error.message;
                    }
                    this.notificationService.error(errorMessage);
                },
            });
    }
}
