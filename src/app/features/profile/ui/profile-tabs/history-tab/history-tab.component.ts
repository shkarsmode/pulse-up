import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, tap } from "rxjs";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { VoteService } from "@/app/shared/services/api/vote.service";
import { AppConstants } from "@/app/shared/constants";
import { IPaginator, ITopic } from "@/app/shared/interfaces";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { CommonModule } from "@angular/common";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { HistoryListItemComponent } from "../history-list-item/history-list-item.component";
import { ActivatedRoute } from "@angular/router";

interface IVoteWithTopic {
    vote: IVote;
    topic?: ITopic;
}

@Component({
    selector: "app-history-tab",
    standalone: true,
    imports: [
        CommonModule,
        InfiniteScrollDirective,
        SpinnerComponent,
        LoadingIndicatorComponent,
        HistoryListItemComponent,
    ],
    providers: [InfiniteLoaderService],
    templateUrl: "./history-tab.component.html",
    styleUrl: "./history-tab.component.scss",
})
export class HistoryTabComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyed = inject(DestroyRef);
    private readonly voteService = inject(VoteService);
    private readonly pulseService = inject(PulseService);
    private readonly profileService = inject(ProfileService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<IVoteWithTopic>);

    private readonly tabIndex = 0;
    private initialLoading = new BehaviorSubject(false);
    public initialLoading$ = this.initialLoading.asObservable();
    public paginator$: Observable<IPaginator<IVoteWithTopic>>;
    public loading$: Observable<boolean>;
    public profile$ = this.profileService.profile$;
    public hasVotes$ = this.profile$.pipe(
        map((profile) => profile?.totalVotes || 0),
        map((count) => !!count),
    );
    public topics = new Map<number, ITopic>();
    public selectedTabIndex = 0;

    constructor() {
        this.route.queryParamMap.pipe(
            takeUntilDestroyed(this.destroyed),
            map((params) => params.get("tab")),
            tap((tab) => {
                const tabFromUrl = Number(tab);
                this.selectedTabIndex = isNaN(tabFromUrl) ? 0 : tabFromUrl;
            })
        ).subscribe();

    }

    ngOnInit(): void {
        this.profile$
            .pipe(
                filter((profile) => !!profile),
                tap((profile) => {
                    if (profile.totalVotes) {
                        this.initialLoading.next(true);
                        this.loadVotes();
                    }
                }),
                takeUntilDestroyed(this.destroyed),
            )
            .subscribe();
    }

    private get isActiveTab(): boolean {
        return this.selectedTabIndex === this.tabIndex;
    }

    public loadMore(paginator: IPaginator<IVoteWithTopic>) {
        if (!this.isActiveTab) return;
        return this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService)(paginator);
    }

    private loadVotes() {
        this.infiniteLoaderService.init({
            load: (page) => {
                return this.voteService
                    .getMyVotes({
                        take: AppConstants.PULSES_PER_PAGE,
                        skip: AppConstants.PULSES_PER_PAGE * (page - 1),
                    })
                    .pipe(
                        switchMap((votes) => {
                            const topicsIds = new Set(votes.map((vote) => vote.topicId));
                            return this.fetchTopicsByIds(Array.from(topicsIds)).pipe(
                                switchMap(() => {
                                    const votesWithTopics = votes.reduce<IVoteWithTopic[]>(
                                        (all, vote) => {
                                            all.push({
                                                vote,
                                                topic: this.topics.get(vote.topicId)!,
                                            });
                                            return all;
                                        },
                                        [],
                                    );
                                    return of(votesWithTopics);
                                }),
                            );
                        }),
                        map((votesWithTopics) => this.convertToPaginator(votesWithTopics, page)),
                        tap(() => this.initialLoading.next(false)),
                    );
            },
        });
        this.paginator$ = this.infiniteLoaderService.paginator$;
        this.loading$ = this.infiniteLoaderService.loading$;
    }

    private convertToPaginator(votes: IVoteWithTopic[], page: number): IPaginator<IVoteWithTopic> {
        return {
            items: votes,
            page: page,
            hasMorePages: votes.length !== 0 && votes.length === AppConstants.PULSES_PER_PAGE,
        };
    }

    private fetchTopicsByIds(topicIds: number[]) {
        const topicsIdsToFetch = topicIds.filter((id) => !this.topics.has(id));
        return this.pulseService
            .get({
                id: topicsIdsToFetch,
            })
            .pipe(
                tap((topics) => {
                    topics.forEach((topic) => {
                        this.topics.set(topic.id, topic);
                    });
                }),
                map((topics) => topics as ITopic[]),
                catchError(() => of([] as ITopic[])),
            );
    }
}
