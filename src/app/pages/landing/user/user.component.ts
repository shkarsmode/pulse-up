import { Component, inject } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { UserService } from "@/app/shared/services/api/user.service";
import { IAuthor, IPulse } from "@/app/shared/interfaces";
import { Location } from "@angular/common";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-author",
    templateUrl: "./user.component.html",
    styleUrl: "./user.component.scss",
})
export class UserComponent {
    public user: IAuthor | null = null;
    public topics: IPulse[] = [];
    public isLoading: boolean = true;
    public pulseId: string = "";

    private readonly router: Router = inject(Router);
    private readonly location: Location = inject(Location);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly userService: UserService = inject(UserService);
    private readonly settingsService: SettingsService = inject(SettingsService);

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
                this.user = user;
                this.isLoading = false;
            })
        });
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
