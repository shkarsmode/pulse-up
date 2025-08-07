import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { filter, map, Observable } from "rxjs";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { ITopic } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { LeaderboardTimeframe } from "../../../interface/leaderboard-timeframe.interface";
import { isCurrentTimeframeActive } from "../../../helpers/isCurrentTimeframeActive";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { AngularSvgIconModule } from "angular-svg-icon";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { MaterialModule } from "@/app/shared/modules/material.module";

@Component({
    selector: "app-leaderboard-list-item",
    standalone: true,
    imports: [
        CommonModule,
        LargePulseComponent,
        LargePulseIconComponent,
        LargePulseTitleComponent,
        LargePulseMetaComponent,
        FormatNumberPipe,
        AngularSvgIconModule,
        WaveAnimationDirective,
        MaterialModule,
    ],
    templateUrl: "./leaderboard-list-item.component.html",
    styleUrl: "./leaderboard-list-item.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardListItemComponent implements OnInit {
    @Input() topic: ITopic;
    @Input() votes: number;
    @Input() users: number;
    @Input() selectedDate: Date | null;
    @Input() selectedTimeframe: LeaderboardTimeframe;

    private votesService = inject(VotesService);
    private settingsService = inject(SettingsService);

    public isActiveTimerange: boolean;
    public isActiveVote$: Observable<boolean>;

    public ngOnInit() {
        this.isActiveTimerange =
            !!this.selectedDate &&
            isCurrentTimeframeActive(this.selectedDate, this.selectedTimeframe);
        this.isActiveVote$ = this.votesService.votesByTopicId$.pipe(
            map((votes) => votes.get(this.topic.id)),
            filter((vote) => vote !== undefined),
            map((vote) => VoteUtils.isActiveVote(vote, this.settingsService.minVoteInterval)),
        );
    }
}
