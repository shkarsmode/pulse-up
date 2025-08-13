import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";
import { map } from "rxjs";
import { PlatformService } from "@/app/shared/services/core/platform.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-get-app-button",
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: "./get-app-button.component.html",
    styleUrl: "./get-app-button.component.scss",
})
export class GetAppButtonComponent implements OnInit {
    @Input() design: "old" | "new" = "new";
    @Input() theme: "light" | "dark" = "light";
    @Input() isOnePlatform = false;

    public platformService: PlatformService = inject(PlatformService);
    public settingsService: SettingsService = inject(SettingsService);

    public platform = this.platformService.value == "iOS" ? "ios" : "android";
    public classes = {
        ["get-app-button--" + this.platform]: false,
    };

    public appStoreUrl$ = this.settingsService.settings$.pipe(
        map((settings) => settings.appStoreUrl)
    );
    public googlePlayUrl$ = this.settingsService.settings$.pipe(
        map((settings) => settings.googlePlayUrl)
    );

    ngOnInit(): void {
        if (this.isOnePlatform) {
            this.classes["get-app-button--" + this.platform] = true;
        }
    }
}
