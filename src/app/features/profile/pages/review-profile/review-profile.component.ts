import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { BehaviorSubject, filter, map, Observable, tap } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { UserStore } from "@/app/shared/stores/user.store";
import { UserAvatarComponent } from "../../../landing/pages/user/components/user-avatar/user-avatar.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { UserService } from "@/app/shared/services/api/user.service";
import { AppConstants } from "@/app/shared/constants";
import { IPaginator, IPulse } from "@/app/shared/interfaces";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { SpinnerComponent } from "../../../../shared/components/ui-kit/spinner/spinner.component";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
    CommonModule,
    RouterModule,
    InfiniteScrollDirective,
    UserAvatarComponent,
    ContainerComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    LargePulseComponent,
    LoadingIndicatorComponent,
    SpinnerComponent
],
    templateUrl: "./review-profile.component.html",
    styleUrl: "./review-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class ReviewProfileComponent {
    private readonly router = inject(Router);
    private userStore = inject(UserStore);
    private readonly userService = inject(UserService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService);

    private initialLoading = new BehaviorSubject(true);
    initialLoading$ = this.initialLoading.asObservable();
    paginator$: Observable<IPaginator<IPulse>>;
    loading$ = new BehaviorSubject(true);
    profile$ = this.userStore.profile$.pipe(filter((profile) => !!profile));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    username$ = this.profile$.pipe(map((profile) => profile.username));
    picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    topicsCount$ = this.profile$.pipe(map((profile) => profile.totalTopics || 0));
    editRpofileRoute = "/" + AppRoutes.Profile.EDIT;

    loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    constructor() {
        this.profile$.pipe(
            filter((profile) => !!profile),
            tap((profile) => {
                this.loadTopics(profile.id, profile.name);
            }),
        ).subscribe();
    }

    private loadTopics(userId: string, name: string) {
        this.infiniteLoaderService.init({
            load: (page) =>
                this.userService
                    .getTopics({
                        userId,
                        page,
                        itemsPerPage: AppConstants.PULSES_PER_PAGE,
                        includeStats: true,
                    })
                    .pipe(
                        map((response) => ({
                            ...response,
                            items: response.items.map((topic) => ({
                                ...topic,
                                author: { ...topic.author, name },
                                stats: {
                                    ...topic.stats,
                                    totalVotes: topic.stats?.totalVotes || 0,
                                    totalUniqueUsers: topic.stats?.totalUniqueUsers || 0,
                                    lastDayVotes: topic.stats?.lastDayVotes || 0,
                                },
                            })),
                        })),
                        tap(() => this.initialLoading.next(false))
                    ),
        });
        this.paginator$ = this.infiniteLoaderService.paginator$;
        this.loading$ = this.infiniteLoaderService.loading$;
    }
}
