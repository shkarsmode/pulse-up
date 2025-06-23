import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, filter, map, Observable, tap } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { SvgIconComponent } from "angular-svg-icon";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { UserAvatarComponent } from "../../../landing/pages/user/components/user-avatar/user-avatar.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { AppConstants } from "@/app/shared/constants";
import { IPaginator, ITopic, TopicState } from "@/app/shared/interfaces";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { ProfileStore } from "@/app/shared/stores/profile.store";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
    CommonModule,
    RouterModule,
    SvgIconComponent,
    InfiniteScrollDirective,
    UserAvatarComponent,
    ContainerComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    LargePulseComponent,
    LoadingIndicatorComponent,
    SpinnerComponent,
    LinkButtonComponent
],
    templateUrl: "./review-profile.component.html",
    styleUrl: "./review-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class ReviewProfileComponent implements OnInit {
    private readonly profileStore = inject(ProfileStore);
    private readonly destroyed = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<ITopic>);

    private initialLoading = new BehaviorSubject(false);
    initialLoading$ = this.initialLoading.asObservable();
    paginator$: Observable<IPaginator<ITopic>>;
    loading$ = new BehaviorSubject(true);
    profile$ = this.profileStore.profile$.pipe(filter((profile) => !!profile));
    bio$ = this.profile$.pipe(map((profile) => profile.bio));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    username$ = this.profile$.pipe(map((profile) => profile.username));
    picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    topicsCount$ = this.profile$.pipe(map((profile) => profile.totalTopics || 0));
    hasTopics$ = this.topicsCount$.pipe(map((count) => !!count));
    editRpofileRoute = "/" + AppRoutes.Profile.EDIT;
    deleteAccountRoute = "/" + AppRoutes.Profile.DELETE_ACCOUNT;
    addTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;

    loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    ngOnInit () {
        this.profile$
            .pipe(
                filter((profile) => !!profile),
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
