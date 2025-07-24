import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { AppConstants } from "@/app/shared/constants/app.constants";
import { IAuthor, IPaginator, ITopic } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { UserService } from "@/app/shared/services/api/user.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { CommonModule, Location } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { map, Observable, take } from "rxjs";
import { TopicQRCodePopupData } from "../../helpers/interfaces/topic-qrcode-popup-data.interface";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { TopicQrcodePopupComponent } from "../../ui/topic-qrcode-popup/topic-qrcode-popup.component";
import { UserAvatarComponent } from "./components/user-avatar/user-avatar.component";
import { LargePulseFooterComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer/large-pulse-footer.component";
import { LargePulseFooterRowComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer-row/large-pulse-footer-row.component";
import { BackButtonComponent } from "@/app/shared/components/ui-kit/buttons/back-button/back-button.component";

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
        FlatButtonDirective,
        FormatNumberPipe,
        QrcodeButtonComponent,
        LargePulseFooterComponent,
        LargePulseFooterRowComponent,
        BackButtonComponent,
    ],
    providers: [InfiniteLoaderService],
})
export class UserComponent {
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(UserService);
    private readonly dialogService = inject(DialogService);
    private readonly settingsService = inject(SettingsService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService<ITopic>);

    public user: IAuthor | null = null;
    public topics: ITopic[] = [];
    public isLoading: boolean = true;
    public pulseId: string = "";
    public paginator$: Observable<IPaginator<ITopic>>;
    public loading$: Observable<boolean>;
    public loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    constructor() {
        this.pulseId = this.router.getCurrentNavigation()?.extras?.state?.["pulseId"] || "";
    }

    ngOnInit(): void {
        this.initUserIdListener();
    }

    private initUserIdListener(): void {
        this.route.paramMap.pipe(take(1)).subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const username = data.get("username")!;
        this.user = null;
        this.topics = [];
        this.isLoading = true;
        this.userService
            .getProfileByUsername(username)
            .pipe(take(1))
            .subscribe((user) => {
                this.userService
                    .getAllTopics(user.id)
                    .pipe(take(1))
                    .subscribe((topics) => {
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

    openQrCodePopup(): void {
        this.dialogService.open<TopicQrcodePopupComponent, TopicQRCodePopupData>(
            TopicQrcodePopupComponent,
            {
                width: "400px",
                data: {
                    link: this.shareProfileUrl,
                    type: "profile",
                },
            },
        );
    }
}
