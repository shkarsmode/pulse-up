import { Campaign, ITopicStats } from '@/app/shared/interfaces';
import { DialogService } from '@/app/shared/services/core/dialog.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, Input } from '@angular/core';
import { getCampaignGoalName } from '../../helpers/getCampaignGoalName';
import { GoalProposalModalComponent } from '../goal-proposal-modal/goal-proposal-modal.component';
import { PulseCampaignModalComponent } from '../pulse-campaign-modal/pulse-campaign-modal.component';

enum CampaignState {
    NO_GOAL = "no_goal",
    NOT_STARTED = "not_started",
    ACTIVE = "active",
    COMPLETED_SUCCESS = "completed_success",
    COMPLETED_FAIL = "completed_fail",
}

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'app-pulse-campaign',
    templateUrl: './pulse-campaign.component.html',
    styleUrl: './pulse-campaign.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulseCampaignComponent {
    @Input() public campaign?: Campaign;
    @Input() public stats?: ITopicStats;

    public CampaignState: typeof CampaignState = CampaignState;

    private readonly dialogService = inject(DialogService);

    @HostListener('click')
    public onHostClick(): void {
        // Don't open modal on click if no campaign
        if (!this.campaign) return;
        
        this.dialogService.open(PulseCampaignModalComponent, {
            width: '335px',
            data: {
                campaign: this.campaign,
                stats: this.stats || {
                    totalUniqueUsers: 0,
                    lastDayVotes: 0,
                    totalVotes: 0,
                },
            },
        });
    }

    public onProposeGoalClick(event: Event): void {
        event.stopPropagation();
        this.dialogService.open(GoalProposalModalComponent, {
            width: '500px',
            maxWidth: '95vw',
        });
    }

    public get currentGoal(): string {
        if (!this.campaign) return '';
        return getCampaignGoalName(this.campaign);
    }

    public get currentGoalReward(): string {
        if (!this.campaign) return '';
        const index = this.campaign.accomplishedGoals?.length || 0;
        // If all goals accomplished, show the last one
        const goalIndex = index >= this.campaign.goals.length ? this.campaign.goals.length - 1 : index;
        return this.campaign.goals[goalIndex]?.reward || '—';
    }

    public get currentGoalInPercent(): number {
        if (!this.campaign || !this.campaign.goals.length) {
            return 0;
        }

        const currentGoalObj = this.campaign.goals[
            this.campaign.accomplishedGoals?.length || 0
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

    private formatNumber(value?: number | string): string {
        const n = Number(value ?? 0);
        return n.toLocaleString();
    }

    public get percentLabel(): string {
        return `${Math.round(this.currentGoalInPercent)}% Complete`;
    }

    public get goalTarget(): number {
        if (!this.campaign) return 0;
        const goal = this.campaign.goals[this.campaign.accomplishedGoals?.length || 0];
        return Number(goal?.supporters ?? goal?.lifetimeVotes ?? goal?.dailyVotes ?? 0);
    }

    public get goalTargetFormatted(): string {
        return this.formatNumber(this.goalTarget);
    }

    public get currentCount(): number {
        const s = this.stats || { totalUniqueUsers: 0, lastDayVotes: 0, totalVotes: 0 };
        const goal = this.campaign?.goals[this.campaign?.accomplishedGoals?.length || 0];
        if (!goal) return 0;
        if (goal.supporters) return s.totalUniqueUsers ?? 0;
        if (goal.lifetimeVotes) return s.totalVotes ?? 0;
        if (goal.dailyVotes) return s.lastDayVotes ?? 0;
        return 0;
    }

    public get progressCountText(): string {
        return `${this.formatNumber(this.currentCount)} / ${this.goalTargetFormatted}`;
    }

    public get daysLeft(): number {
        if (!this.campaign) return 0;
        const now = new Date();
        const startsAt = new Date(this.campaign.startsAt);
        const endsAt = new Date(this.campaign.endsAt);
        const target = now < startsAt ? startsAt : endsAt;
        const ms = Math.max(0, target.getTime() - now.getTime());
        return Math.ceil(ms / (1000 * 60 * 60 * 24));
    }

    public get campaignState(): CampaignState | null {
        if (!this.campaign) return CampaignState.NO_GOAL;

        const now = new Date();
        const startsAt = new Date(this.campaign.startsAt);
        const endsAt = new Date(this.campaign.endsAt);
        const totalGoals = this.campaign.goals.length;
        const completedGoals = this.campaign.accomplishedGoals?.length || 0;

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
