import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { combineLatest, filter, map } from "rxjs";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { AngularSvgIconModule } from "angular-svg-icon";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { TimeFromNowPipe } from "@/app/shared/pipes/time-from-now.pipe";
import { LeaderboardListItemService } from "./leaderboard-list-item.service";

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
        TimeFromNowPipe,
    ],
    templateUrl: "./leaderboard-list-item.component.html",
    styleUrl: "./leaderboard-list-item.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardListItemComponent {
    @Input() topic: ITopic;
    @Input() votes: number;
    @Input() users: number;
    @Input() lastPulse?: string;

    private votesService = inject(VotesService);
    private settingsService = inject(SettingsService);
    private leaderboardListItemService = inject(LeaderboardListItemService);

    public isActiveTimeframe$ = this.leaderboardListItemService.isActiveTimeframe$;
    public isSupportersVisible$ = this.leaderboardListItemService.isSupportersVisible$;
    public isActiveVote$ = combineLatest([
        this.votesService.votesByTopicId$.pipe(
            map((votes) => votes && votes.get(this.topic.id)),
            filter((vote) => !!vote),
        ),
        this.settingsService.settings$,
    ]).pipe(
        map(([vote, settings]) => {
            return VoteUtils.isActiveVote(vote, settings.minVoteInterval);
        }),
    );

    public get isArchived() {
        return this.topic.state === TopicState.Archived;
    }
}
