import { Component, HostBinding, HostListener, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { map } from "rxjs";
import { FormatNumberPipe } from "../../../pipes/format-number.pipe";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { ILeaderboardTopicData } from "@/app/shared/interfaces/topic/get-leaderboard-topics-response.interface";

@Component({
    selector: "app-top-pulse-card",
    standalone: true,
    imports: [CommonModule, SvgIconComponent, FormatNumberPipe],
    templateUrl: "./top-pulse-card.component.html",
    styleUrl: "./top-pulse-card.component.scss",
})
export class TopPulseCardComponent {
    @Input() public data: ILeaderboardTopicData;
    @Input() public index: number;
    @Input() public interactive = true;

    private readonly router: Router = inject(Router);
    private readonly settingsService: SettingsService = inject(SettingsService);

    @HostBinding("class.intercactive")
    public get isInteractive() {
        return this.interactive;
    }

    public topicIcon$ = this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix + this.data.topic.icon),
    );

    @HostListener("click")
    public onPulseClick(): void {
        if (this.interactive) {
            this.router.navigateByUrl(`topic/${this.data.topic.id}`);
        }
    }
}
