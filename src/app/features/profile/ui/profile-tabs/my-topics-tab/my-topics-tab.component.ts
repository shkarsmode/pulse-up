import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { BehaviorSubject, filter, map, Observable, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { IPaginator, ITopic, TopicState } from "@/app/shared/interfaces";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { AppConstants } from "@/app/shared/constants";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { LargePulseFooterComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer/large-pulse-footer.component";
import { LargePulseFooterRowComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer-row/large-pulse-footer-row.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { TimeToEndPipe } from "@/app/shared/pipes/time-to-end.pipe";

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
        LargePulseComponent,
        LoadingIndicatorComponent,
        LargePulseFooterComponent,
        LargePulseFooterRowComponent,
        TimeToEndPipe,
    ],
    providers: [InfiniteLoaderService],
    standalone: true,
})
export class MyTopicsTabComponent implements OnInit {
    private readonly destroyed = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);
    private readonly profileService = inject(ProfileService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<ITopic>);

    private initialLoading = new BehaviorSubject(false);
    initialLoading$ = this.initialLoading.asObservable();
    paginator$: Observable<IPaginator<ITopic>>;
    loading$: Observable<boolean>;
    profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    topicsCount$ = this.profile$.pipe(map((profile) => profile.totalTopics || 0));
    hasTopics$ = this.topicsCount$.pipe(map((count) => !!count));
    addTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;

    loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    ngOnInit() {
        this.profile$
            .pipe(
                tap((profile) => {
                    if (profile.totalTopics) {
                        this.initialLoading.next(true);
                        this.loadTopics(profile.name);
                    }
                }),
                takeUntilDestroyed(this.destroyed),
            )
            .subscribe();
    }

    isNotExpired(date: string): boolean {
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
