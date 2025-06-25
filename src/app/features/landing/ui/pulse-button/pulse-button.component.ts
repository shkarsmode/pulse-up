import { Component, inject, Input, DestroyRef, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { auditTime, first } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { HeartBeatDirective } from "@/app/shared/animations/heart-beat.directive";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { VoteTimeLeftComponent } from "../vote-time-left/vote-time-left.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { VotingError, VotingErrorCode } from "@/app/shared/helpers/errors/voting-error";
import { SignInRequiredPopupComponent } from "../sign-in-required-popup/sign-in-required-popup.component";

@Component({
    selector: "app-pulse-button",
    standalone: true,
    imports: [
        CommonModule,
        PrimaryButtonComponent,
        SvgIconComponent,
        HeartBeatDirective,
        VoteTimeLeftComponent,
    ],
    templateUrl: "./pulse-button.component.html",
    styleUrl: "./pulse-button.component.scss",
})
export class PulseButtonComponent {
    private destroyRef = inject(DestroyRef);
    private dialog: MatDialog = inject(MatDialog);
    private votingService = inject(VotingService);
    private settingsService = inject(SettingsService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthenticationService);

    @Input() topicId: number | null = null;
    @Input() vote: IVote | null = null;
    @Output() voteExpired = new EventEmitter<void>();
    @Output() voted = new EventEmitter<IVote>();

    isVoting = false;
    isActiveVote = false;
    lastVoteInfo = "";
    isAnonymousUser = this.authService.anonymousUserValue;

    ngOnInit() {
        this.votingService.isVoting$
            .pipe(auditTime(750), takeUntilDestroyed(this.destroyRef))
            .subscribe((isVoting) => {
                this.isVoting = isVoting;
            });

        if (!this.vote) return;

        this.isActiveVote =
            !!this.vote && VoteUtils.isActiveVote(this.vote, this.settingsService.minVoteInterval);
        if (this.isActiveVote) {
            this.lastVoteInfo = VoteUtils.parseVoteInfo(this.vote);
        }
    }

    onPulse() {
        if (this.isVoting || this.isActiveVote || !this.topicId) return;

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
                    this.isActiveVote = true;
                    this.lastVoteInfo = VoteUtils.parseVoteInfo(vote);
                    this.notificationService.success("Thank you for your vote!");
                    this.voted.emit(vote);
                },
                error: (error) => {
                    if (error instanceof VotingError) {
                        if (error.code === VotingErrorCode.NOT_AUTHORIZED) {
                            this.dialog.open(SignInRequiredPopupComponent, {
                                width: "500px",
                                panelClass: "custom-dialog-container",
                                backdropClass: "custom-dialog-backdrop",
                            });
                            return;
                        }
                    }
                    this.notificationService.error(error.message || "Failed to vote");
                },
            });
    }

    onVoteExpired() {
        this.isActiveVote = false;
        this.lastVoteInfo = "";
        this.voteExpired.emit();
    }
}
