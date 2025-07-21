import { Campaign, ITopicStats } from '@/app/shared/interfaces';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-pulse-campaign-modal',
    templateUrl: './pulse-campaign-modal.component.html',
    styleUrl: './pulse-campaign-modal.component.scss',
    standalone: true,
    imports: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PulseCampaignModalComponent {
    public campaign: Campaign;
    public stats?: ITopicStats;

    public readonly data: { campaign: Campaign, stats: ITopicStats } = inject(MAT_DIALOG_DATA);
    public readonly dialogRef: MatDialogRef<PulseCampaignModalComponent> = inject(MatDialogRef);

    constructor () {
        this.campaign = this.data.campaign;
        this.stats = this.data.stats;
    }

    public get campaignEnded(): boolean {
        return new Date(this.campaign.endsAt) < new Date();
    }

    public get isCampaignSuccessful(): boolean {
        return this.campaign.accomplishedGoals.length === this.campaign.goals.length;
    }

    public get formattedDate(): string {
        const end = new Date(this.campaign.endsAt);
        const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
        return end.toLocaleDateString(undefined, options);
    }

    public getGoalProgress(goalIndex: number): number {
        if (!this.campaign || !this.campaign.goals.length) {
            return 0;
        }

        const goal = this.campaign.goals[goalIndex];
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

    public getGoalCurrentValue(goalIndex: number): string | number {
        const { totalUniqueUsers, lastDayVotes, totalVotes } = this.stats || {};
        const goal = this.campaign.goals[goalIndex];

        switch (true) {
            case !!goal?.supporters:
                return totalUniqueUsers + ' supporters' ?? 0;
            case !!goal?.dailyVotes:
                return lastDayVotes + ' daily pulses' ?? 0;
            case !!goal?.lifetimeVotes:
                return totalVotes + ' lifetime pulses' ?? 0;
            default:
                return 0;
        }
    }

    public getGoalTargetValue(goalIndex: number): number {
        const goal = this.campaign.goals[goalIndex];
        return goal?.supporters || goal?.dailyVotes || goal?.lifetimeVotes || 0;
    }

    public getGoalColor(goalIndex: number): string {
        const progress = this.getGoalProgress(goalIndex);
        if (progress >= 100) {
            return '#00C105';
        }
        return '#5E00CC';
    }
}
