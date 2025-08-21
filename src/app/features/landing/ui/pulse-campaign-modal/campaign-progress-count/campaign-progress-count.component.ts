import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { ITopicStats } from "@/app/shared/interfaces";
import { CampaignGoalExtended } from "../../../interfaces/campaign-goal-extended.interface";

@Component({
    selector: "app-campaign-progress-count",
    standalone: true,
    imports: [],
    templateUrl: "./campaign-progress-count.component.html",
    styleUrl: "./campaign-progress-count.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignProgressCountComponent implements OnInit {
    @Input() goal: CampaignGoalExtended;
    @Input() topicStats: ITopicStats;

    public goalCurrentValue: string;
    public goalTargetValue: number;

    public ngOnInit(): void {
        this.goalCurrentValue = this.getGoalCurrentValue();
        this.goalTargetValue = this.getGoalTargetValue();
    }

    private getGoalCurrentValue(): string {
        const { totalUniqueUsers, lastDayVotes, totalVotes } = this.topicStats || {};
        switch (true) {
            case !!this.goal?.supporters:
                return (totalUniqueUsers ?? 0) + " supporters";
            case !!this.goal?.dailyVotes:
                return (lastDayVotes ?? 0) + " daily pulses";
            case !!this.goal?.lifetimeVotes:
                return (totalVotes ?? 0) + " lifetime pulses";
            default:
                return "0";
        }
    }

    private getGoalTargetValue(): number {
        return this.goal?.supporters || this.goal?.dailyVotes || this.goal?.lifetimeVotes || 0;
    }
}
