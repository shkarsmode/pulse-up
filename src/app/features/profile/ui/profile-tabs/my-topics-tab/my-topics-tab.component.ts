import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, filter, map, Observable, tap } from "rxjs";
import { SvgIconComponent } from "angular-svg-icon";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { IPaginator, ITopic, TopicState } from "@/app/shared/interfaces";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { AppConstants } from "@/app/shared/constants";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { MyTopicsListItemComponent } from "../my-topics-list-item/my-topics-list-item.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";

@Component({
    selector: "app-my-topics-tab",
    templateUrl: "./my-topics-tab.component.html",
    styleUrl: "./my-topics-tab.component.scss",
    imports: [
        CommonModule,
        RouterModule,
        SvgIconComponent,
        InfiniteScrollDirective,
        SpinnerComponent,
        LoadingIndicatorComponent,
        MyTopicsListItemComponent,
    ],
    providers: [InfiniteLoaderService],
    standalone: true,
})
export class MyTopicsTabComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);
    private readonly profileService = inject(ProfileService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<ITopic>);
    private readonly votesService = inject(VotesService);

    private readonly tabIndex = 1;
    private initialLoading = new BehaviorSubject(false);
    public initialLoading$ = this.initialLoading.asObservable();
    public paginator$: Observable<IPaginator<ITopic>>;
    public loading$: Observable<boolean>;
    public profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    public topicsCount$ = this.profile$.pipe(map((profile) => profile.totalTopics || 0));
    public hasTopics$ = this.topicsCount$.pipe(map((count) => !!count));
    public addTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;
    public votes$ = this.votesService.votesByTopicId$.pipe(takeUntilDestroyed(this.destroyRef));
    public selectedTabIndex = 0;

    constructor() {
        const tabFromUrl = Number(this.route.snapshot.queryParamMap.get("tab"));
        this.selectedTabIndex = isNaN(tabFromUrl) ? 0 : tabFromUrl;
    }

    ngOnInit() {
        this.profile$
            .pipe(
                tap((profile) => {
                    if (profile.totalTopics) {
                        this.initialLoading.next(true);
                        this.loadTopics(profile.name);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private get isActiveTab(): boolean {
        return this.selectedTabIndex === this.tabIndex;
    }

    public loadMore(paginator: IPaginator<ITopic>) {
        if (!this.isActiveTab) return;
        return this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService)(paginator);
    }

    public isNotExpired(date: string): boolean {
        return new Date(date) > new Date();
    }

    private loadTopics(name: string) {
        this.infiniteLoaderService.init({
            load: (page) => {
                return this.pulseService
                    .getMyTopics({
                        take: AppConstants.PULSES_PER_PAGE,
                        skip: AppConstants.PULSES_PER_PAGE * (page - 1),
                        state: [TopicState.Active, TopicState.Archived, TopicState.Blocked],
                        includeStats: true,
                    })
                    .pipe(
                        map((topics) => this.sortByDate(topics)),
                        map((topics) => this.fillWithDefaultValues(topics, name)),
                        map((topics) => this.convertToPaginator(topics, page)),
                        tap(() => this.initialLoading.next(false)),
                    );
            },
        });
        this.paginator$ = this.infiniteLoaderService.paginator$;
        this.loading$ = this.infiniteLoaderService.loading$;
    }

    private convertToPaginator(topics: ITopic[], page: number): IPaginator<ITopic> {
        return {
            items: topics,
            page: page,
            hasMorePages: topics.length !== 0 && topics.length === AppConstants.PULSES_PER_PAGE,
        };
    }

    private fillWithDefaultValues(topics: ITopic[], authorName: string): ITopic[] {
        return topics.map((topic) => ({
            ...topic,
            author: { ...topic.author, name: authorName },
            stats: {
                ...topic.stats,
                totalVotes: topic.stats?.totalVotes || 0,
                totalUniqueUsers: topic.stats?.totalUniqueUsers || 0,
                lastDayVotes: topic.stats?.lastDayVotes || 0,
            },
        }));
    }

    private sortByDate(topics: ITopic[]): ITopic[] {
        return topics.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }
}
