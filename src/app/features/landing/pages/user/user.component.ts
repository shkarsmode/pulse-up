import { Component, inject } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { BehaviorSubject, map, Observable, scan, switchMap, tap } from "rxjs";
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { UserService } from "@/app/shared/services/api/user.service";
import { IAuthor, IPulse, IPulsesPaginator } from "@/app/shared/interfaces";
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

@Component({
    selector: "app-author",
    templateUrl: "./user.component.html",
    styleUrl: "./user.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        InfiniteScrollDirective,
        SvgIconComponent,
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
})
export class UserComponent {
    public user: IAuthor | null = null;
    public topics: IPulse[] = [];
    public isLoading: boolean = true;
    public pulseId: string = "";

    public paginator$: Observable<IPulsesPaginator>;
    public loading$ = new BehaviorSubject(true);
    private page$ = new BehaviorSubject(1);

    private readonly router: Router = inject(Router);
    private readonly location: Location = inject(Location);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly userService: UserService = inject(UserService);
    private readonly settingsService: SettingsService = inject(SettingsService);

    constructor() {
        this.pulseId = this.router.getCurrentNavigation()?.extras?.state?.["pulseId"] || "";
        this.paginator$ = this.loadProducts$();
    }

    ngOnInit(): void {
        this.initUserIdListener();
    }

    private loadProducts$(): Observable<IPulsesPaginator> {
        return this.page$.pipe(
            tap(() => this.loading$.next(true)),
            switchMap((page) => this.userService.getTopics({
                userId: this.user?.id || "",
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
                    }))
                }))
            )),
            scan(this.updatePaginator, { items: [], page: 0, hasMorePages: true } as IPulsesPaginator),
            tap(() => this.loading$.next(false)),
        );
    }

    private updatePaginator(accumulator: IPulsesPaginator, value: IPulsesPaginator): IPulsesPaginator {
        if (value.page === 1) {
            return value;
        }

        accumulator.items.push(...value.items);
        accumulator.page = value.page;
        accumulator.hasMorePages = value.hasMorePages;

        return accumulator;
    }

    public loadMoreProducts(paginator: IPulsesPaginator) {
        if (!paginator.hasMorePages) {
            return;
        }
        this.page$.next(paginator.page + 1);
    }

    private initUserIdListener(): void {
        // this.route.paramMap.subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    // private handlePulseUrlIdListener(data: ParamMap): void {
    //     const username = data.get("username")!;
    //     this.user = null;
    //     this.topics = [];
    //     this.isLoading = true;
    //     this.userService.getProfileByUsername(username).subscribe((user) => {
    //         this.userService.getAllTopics(user.id).subscribe((topics) => {
    //             this.topics = topics.map((topic) => ({
    //                 ...topic,
    //                 author: { ...topic.author, name: this.user?.name || "" },
    //             }));
    //             this.user = user;
    //             this.isLoading = false;
    //         })
    //     });
    // }

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
