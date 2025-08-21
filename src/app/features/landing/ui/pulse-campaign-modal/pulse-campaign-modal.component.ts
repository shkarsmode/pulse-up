import { Campaign, ITopicStats } from "@/app/shared/interfaces";
import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CampaignProgressCountComponent } from "./campaign-progress-count/campaign-progress-count.component";
import { CampaignGoalExtended } from "../../interfaces/campaign-goal-extended.interface";

@Component({
    selector: "app-pulse-campaign-modal",
    templateUrl: "./pulse-campaign-modal.component.html",
    styleUrl: "./pulse-campaign-modal.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        AngularSvgIconModule,
        CampaignProgressCountComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulseCampaignModalComponent {
    public campaign: Campaign;
    public goals: CampaignGoalExtended[];
    public stats: ITopicStats;

    public readonly data: { campaign: Campaign; stats: ITopicStats } = inject(MAT_DIALOG_DATA);
    public readonly dialogRef: MatDialogRef<PulseCampaignModalComponent> = inject(MatDialogRef);

    constructor() {
        this.campaign = this.data.campaign;
        this.stats = this.data.stats;

        let hasGoalsInProgress = false;
        this.goals = this.campaign.goals.map((goal, index) => {
            const isAccomplished = !!this.campaign.accomplishedGoals?.[index] || false;
            const isInProgress = !isAccomplished && !hasGoalsInProgress;
            if (isInProgress) {
                hasGoalsInProgress = true;
            }
            return {
                ...goal,
                isAccomplished: isAccomplished,
                isInProgress: isInProgress,
            };
        });
    }

    public get campaignEnded(): boolean {
        return new Date(this.campaign.endsAt) < new Date();
    }

    public get isCampaignSuccessful(): boolean {
        return (
            !!this.campaign.accomplishedGoals &&
            this.campaign.accomplishedGoals.length === this.campaign.goals.length
        );
    }

    public get formattedDate(): string {
        const end = new Date(this.campaign.endsAt);
        const options = { year: "numeric", month: "long", day: "numeric" } as const;
        return end.toLocaleDateString(undefined, options);
    }

    public getGoalProgress(goalIndex: number): number {
        if (!this.goals.length) {
            return 0;
        }

        const goal = this.goals[goalIndex];

        if (goal.isAccomplished) return 100;
        if (!goal.isInProgress) return 0;
        
        const { totalUniqueUsers, lastDayVotes, totalVotes } = this.stats || {};

        switch (true) {
            case !!goal?.supporters:
                return Math.min(((totalUniqueUsers ?? 0) / +goal.supporters) * 100, 100);
            case !!goal?.dailyVotes:
                return Math.min(((lastDayVotes ?? 0) / +goal.dailyVotes) * 100, 100);
            case !!goal?.lifetimeVotes:
                return Math.min(((totalVotes ?? 0) / +goal.lifetimeVotes) * 100, 100);
            default:
                return 0;
        }
    }

    public getGoalColor(goalIndex: number): string {
        const progress = this.getGoalProgress(goalIndex);
        if (progress >= 100) {
            return "#00C105";
        }
        return "#5E00CC";
    }
}
