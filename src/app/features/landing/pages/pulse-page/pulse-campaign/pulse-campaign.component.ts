import { Campaign, ITopicStats } from '@/app/shared/interfaces';
import { ChangeDetectionStrategy, Component, HostListener, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PulseCampaignModalComponent } from '../pulse-campaign-modal/pulse-campaign-modal.component';

enum CampaignState {
    NOT_STARTED = "not_started",
    ACTIVE = "active",
    COMPLETED_SUCCESS = "completed_success",
    COMPLETED_FAIL = "completed_fail",
}

@Component({
    standalone: true,
    imports: [],
    selector: 'app-pulse-campaign',
    templateUrl: './pulse-campaign.component.html',
    styleUrl: './pulse-campaign.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulseCampaignComponent {
    @Input() public campaign: Campaign;
    @Input() public stats?: ITopicStats;

    public CampaignState: typeof CampaignState = CampaignState;

    private readonly dialog = inject(MatDialog);

    @HostListener('click')
    public onHostClick(): void {
        this.dialog.open(PulseCampaignModalComponent, {
            data: {
                campaign: this.campaign,
                stats: this.stats,
            },
        });
    }

    public get currentGoal(): number {
        if (!this.campaign || !this.campaign.goals.length) {
            return 0;
        }
        const currentGoalObj = this.campaign.goals[
            this.campaign.accomplishedGoals.length
        ];

        return currentGoalObj?.supporters ??
            currentGoalObj?.lifetimeVotes ??
            currentGoalObj?.dailyVotes ?? 0;
    }

    public get currentGoalInPercent(): number {
        if (!this.campaign || !this.campaign.goals.length) {
            return 0;
        }

        const currentGoalObj = this.campaign.goals[
            this.campaign.accomplishedGoals.length
        ];

        const { totalUniqueUsers, lastDayVotes, totalVotes } = this.stats || {};

        switch (true) {
            case !!currentGoalObj?.supporters:
                return  (totalUniqueUsers ?? 0) / (+currentGoalObj.supporters) * 100;
            case !!currentGoalObj?.dailyVotes:
                return (lastDayVotes ?? 0) / (+currentGoalObj.dailyVotes) * 100;
            case !!currentGoalObj?.lifetimeVotes:
                return (totalVotes ?? 0) / (+currentGoalObj.lifetimeVotes) * 100;
            default:
                return 0;
        }
    }

    public get campaignState(): CampaignState | null {
        if (!this.campaign) return null;

        const now = new Date();
        const startsAt = new Date(this.campaign.startsAt);
        const endsAt = new Date(this.campaign.endsAt);
        const totalGoals = this.campaign.goals.length;
        const completedGoals = this.campaign.accomplishedGoals.length;

        if (completedGoals === totalGoals) {
            return CampaignState.COMPLETED_SUCCESS;
        }
        if (now < startsAt) return CampaignState.NOT_STARTED;
        if (now >= startsAt && now <= endsAt) return CampaignState.ACTIVE;
        if (now > endsAt) {
            return CampaignState.COMPLETED_FAIL;
        }

        return null;
    }
}
