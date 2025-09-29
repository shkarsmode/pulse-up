import { Component, computed, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { SvgIconComponent } from "angular-svg-icon";
import { catchError, map, Observable, of, switchMap, take, tap } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { AppConstants } from "@/app/shared/constants/app.constants";
import { IPaginator, IProfile, ITopic } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { UserService } from "@/app/shared/services/api/user.service";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { UserAvatarComponent } from "../../ui/user-avatar/user-avatar.component";
import { BackButtonComponent } from "@/app/shared/components/ui-kit/buttons/back-button/back-button.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { UserTopicsListItemComponent } from "../../ui/user-topics-list-item/user-topics-list-item.component";
import { LinkifyPipe } from "@/app/shared/pipes/linkify.pipe";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { isHttpErrorResponse } from "@/app/shared/helpers/errors/isHttpErrorResponse";
import { LendingPageLayoutComponent } from "../../ui/lending-page-layout/lending-page-layout.component";

@Component({
    selector: "app-author",
    templateUrl: "./user.component.html",
    styleUrl: "./user.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        InfiniteScrollDirective,
        SvgIconComponent,
        LoadingIndicatorComponent,
        SpinnerComponent,
        ContainerComponent,
        UserAvatarComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        FadeInDirective,
        FlatButtonDirective,
        FormatNumberPipe,
        QrcodeButtonComponent,
        BackButtonComponent,
        UserTopicsListItemComponent,
        LinkifyPipe,
        LendingPageLayoutComponent,
    ],
    providers: [InfiniteLoaderService],
})
export class UserComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(UserService);
    private readonly settingsService = inject(SettingsService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<ITopic>);
    private readonly votesService = inject(VotesService);

    private settings = toSignal(this.settingsService.settings$);

    public user: IProfile | null = null;
    public topics: ITopic[] = [];
    public isLoading = true;
    public pulseId = "";
    public paginator$: Observable<IPaginator<ITopic>>;
    public loading$: Observable<boolean>;
    public votes$ = this.votesService.votesByTopicId$;

    public shareProfileUrl = computed(() => {
        const settings = this.settings();
        if (!settings) return "";
        return settings.shareUserBaseUrl + this.user?.username;
    });

    public get qrCodePopupText(): string {
        return `Share ${this.user?.name}’s profile with this QR code.`;
    }

    constructor() {
        this.pulseId = this.router.getCurrentNavigation()?.extras?.state?.["pulseId"] || "";
    }

    ngOnInit(): void {
        this.initUserIdListener();
    }

    public loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    private initUserIdListener(): void {
        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => this.handlePulseUrlIdListener(data));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const username = data.get("username")!;
        this.user = null;
        this.topics = [];
        this.isLoading = true;
        this.userService
            .getProfileByUsername(username)
            .pipe(
                switchMap((user) => {
                    return this.userService.getAllTopics(user.id).pipe(
                        take(1),
                        map((topics) => {
                            return {
                                user,
                                topics,
                            };
                        }),
                    );
                }),
                tap(({ user, topics }) => {
                    this.topics = topics.map((topic) => ({
                        ...topic,
                        author: { ...topic.author, name: user.name || "" },
                    }));
                    this.loadTopics(user.id);
                    this.user = user;
                    this.isLoading = false;
                }),
                catchError((error: unknown) => {
                    console.log("Error fetching user profile:", error);
                    this.isLoading = false;
                    if (isHttpErrorResponse(error) && error.status === 404) {
                        this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                    }
                    return of(error);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private loadTopics(userId: string) {
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
                                author: { ...topic.author, name: this.user?.name || "" },
                                stats: {
                                    ...topic.stats,
                                    totalVotes: topic.stats?.totalVotes || 0,
                                    totalUniqueUsers: topic.stats?.totalUniqueUsers || 0,
                                    lastDayVotes: topic.stats?.lastDayVotes || 0,
                                },
                            })),
                        })),
                    ),
        });
        this.paginator$ = this.infiniteLoaderService.paginator$;
        this.loading$ = this.infiniteLoaderService.loading$;
    }

    public goBack(): void {
        if (!this.pulseId) {
            this.router.navigateByUrl("/", {
                replaceUrl: true,
            });
            return;
        }
        this.location.back();
    }

    public onCopyLink(event: MouseEvent) {
        event.stopPropagation();
    }
}
