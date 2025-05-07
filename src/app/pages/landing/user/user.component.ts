import { Component, inject } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { combineLatest } from "rxjs";
import { UserService } from "@/app/shared/services/api/user.service";
import { IAuthor, IPulse } from "@/app/shared/interfaces";

@Component({
    selector: "app-author",
    templateUrl: "./user.component.html",
    styleUrl: "./user.component.scss",
})
export class UserComponent {
    public user: IAuthor | null = null;
    public topics: IPulse[] = [];
    public isLoading: boolean = true;
    public topicId: string = "";
    public totalReceivedVotes: number = 0;
    public votesReceivedFor24Hours: number = 0;

    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly userService: UserService = inject(UserService);

    ngOnInit(): void {
        this.initUserIdListener();
    }

    private initUserIdListener(): void {
        this.route.paramMap.subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const userId = data.get("userId")!;
        const topicId = data.get("topicId")!;
        this.user = null;
        this.topics = [];
        this.isLoading = true;
        this.topicId = topicId;
        const user$ = this.userService.getProfile(userId);
        const topics$ = this.userService.getAllTopics(userId);
        combineLatest([user$, topics$]).subscribe(([user, topics]) => {
            this.user = user;
            this.topics = topics.map((topic) => ({
                ...topic,
                author: { ...topic.author, name: this.user?.name || "" },
            }));
            this.isLoading = false;
            this.countVotes();
        });
    }

    public goBack(): void {
        this.router.navigate(["/topic", this.topicId], {
            replaceUrl: true,
        });
    }

    public countVotes() {
        const { total, lastDay } = this.topics.reduce(
            (acc, topic) => {
                if (topic.stats?.lastDayVotes) {
                    acc.lastDay += topic.stats.lastDayVotes;
                }
                if (topic.stats?.totalVotes) {
                    acc.total += topic.stats.totalVotes;
                }
                return acc;
            },
            {
                total: 0,
                lastDay: 0,
            },
        );
        this.totalReceivedVotes = total;
        this.votesReceivedFor24Hours = lastDay;
    }
}
