import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { map, tap } from "rxjs";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-small-pulse-icon",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./small-pulse-icon.component.html",
    styleUrl: "./small-pulse-icon.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallPulseIconComponent {
    @Input() url: string;
    @Input() label: string;

    private readonly settingsService = inject(SettingsService);

    public topicIcon$ = this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix + this.url),
        tap((iconUrl) => console.log("Topic icon URL:", iconUrl)),
    );
}
