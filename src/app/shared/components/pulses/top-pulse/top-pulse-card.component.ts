import { Component, HostBinding, HostListener, inject, Input } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { ITopic } from "../../../interfaces";
import { FormatNumberPipe } from "../../../pipes/format-number.pipe";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { map } from "rxjs";

@Component({
    selector: "app-top-pulse-card",
    standalone: true,
    imports: [CommonModule, SvgIconComponent, FormatNumberPipe],
    templateUrl: "./top-pulse-card.component.html",
    styleUrl: "./top-pulse-card.component.scss",
})
export class TopPulseCardComponent {
    @Input() public pulse: ITopic;
    @Input() public index: number;
    @Input() public interactive = true;

    private readonly router: Router = inject(Router);
    private readonly settingsService: SettingsService = inject(SettingsService);

    @HostBinding("class.intercactive")
    public get isInteractive() {
        return this.interactive;
    }

    public topicIcon$ = this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix + this.pulse.icon),
    );

    @HostListener("click")
    public onPulseClick(): void {
        if (this.interactive) {
            this.router.navigateByUrl(`topic/${this.pulse.id}`);
        }
    }
}
