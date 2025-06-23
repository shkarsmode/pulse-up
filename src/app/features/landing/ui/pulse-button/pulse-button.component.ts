import { Component, inject, Input, DestroyRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { auditTime, first } from "rxjs";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { HeartBeatDirective } from "@/app/shared/animations/heart-beat.directive";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";

@Component({
    selector: "app-pulse-button",
    standalone: true,
    imports: [CommonModule, PrimaryButtonComponent, SvgIconComponent, HeartBeatDirective],
    templateUrl: "./pulse-button.component.html",
    styleUrl: "./pulse-button.component.scss",
})
export class PulseButtonComponent {
    private votingService = inject(VotingService);
    private settingsService = inject(SettingsService);
    private notificationService = inject(NotificationService);
    private destroyRef = inject(DestroyRef);

    @Input() topicId: number | null = null;
    @Input() vote: IVote | null = null;

    isVoting = false;
    isSuccess = false;
    isActiveVote = false;
    location = "Location";

    ngOnInit() {
        this.votingService.isVoting$
            .pipe(auditTime(750), takeUntilDestroyed(this.destroyRef))
            .subscribe((isVoting) => {
                this.isVoting = isVoting;
            });

        if (!this.vote) return;

        this.isActiveVote = !!this.vote && VoteUtils.isActiveVote(this.vote);
        if (this.isActiveVote) {
            this.isSuccess = this.isActiveVote;
            this.location = VoteUtils.parseVoteLocation(this.vote.location);
        }
    }

    onPulse() {
        if (!this.topicId) return;
        this.votingService
            .vote({
                topicId: this.topicId,
            })
            .pipe(
                first((vote) => !!vote),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (vote) => {
                    this.isSuccess = true;
                    this.location = VoteUtils.parseVoteInfo(vote);
                    this.notificationService.success("Thank you for your vote!");
                },
                error: (error) => {
                    console.log({ error });
                    
                    this.notificationService.error(error.message || "Failed to vote");
                },
                complete: () => {
                    this.isVoting = false;
                },
            });
    }
}
