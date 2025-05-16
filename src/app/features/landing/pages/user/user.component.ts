import { Component, inject } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { BehaviorSubject, map, Observable } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { UserService } from "@/app/shared/services/api/user.service";
import { IAuthor, IPaginator, IPulse } from "@/app/shared/interfaces";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { SvgIconComponent } from "angular-svg-icon";
import { UserAvatarComponent } from "./components/user-avatar/user-avatar.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { AppConstants } from "@/app/shared/constants/app.constants";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";

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
        LargePulseComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        FadeInDirective,
        FormatNumberPipe,
    ],
    providers: [InfiniteLoaderService],
})
export class UserComponent {
    private readonly router: Router = inject(Router);
    private readonly location: Location = inject(Location);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly userService: UserService = inject(UserService);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly infiniteLoaderService: InfiniteLoaderService<IPulse> =
        inject(InfiniteLoaderService);

    public user: IAuthor | null = null;
    public topics: IPulse[] = [];
    public isLoading: boolean = true;
    public pulseId: string = "";
    public paginator$: Observable<IPaginator<IPulse>>;
    public loading$ = new BehaviorSubject(true);
    public loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    constructor() {
        this.pulseId = this.router.getCurrentNavigation()?.extras?.state?.["pulseId"] || "";
    }

    ngOnInit(): void {
        this.initUserIdListener();
    }

    private initUserIdListener(): void {
        this.route.paramMap.subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const username = data.get("username")!;
        this.user = null;
        this.topics = [];
        this.isLoading = true;
        this.userService.getProfileByUsername(username).subscribe((user) => {
            this.userService.getAllTopics(user.id).subscribe((topics) => {
                this.topics = topics.map((topic) => ({
                    ...topic,
                    author: { ...topic.author, name: this.user?.name || "" },
                }));
                this.loadTopics(user.id);
                this.user = user;
                this.isLoading = false;
            });
        });
    }

    private loadTopics(userId: string) {
        this.infiniteLoaderService.init({
            load: (page) =>
                this.userService.getTopics({
                    userId,
                    page,
                    itemsPerPage: AppConstants.PULSES_PER_PAGE,
                    includeStats: true,
                }).pipe(
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
                    }))
                ),
        });
        this.paginator$ = this.infiniteLoaderService.paginator$;
        this.loading$ = this.infiniteLoaderService.loading$;
    }

    get shareProfileUrl(): string {
        return this.settingsService.shareUserBaseUrl + this.user?.username;
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
