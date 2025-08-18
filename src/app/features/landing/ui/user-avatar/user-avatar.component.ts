import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-user-avatar",
    templateUrl: "./user-avatar.component.html",
    styleUrl: "./user-avatar.component.scss",
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
})
export class UserAvatarComponent {
    @Input() public name = "";
    @Input() public width = 80;
    @Input() public height = 80;
    @Input()
    set url(value: string | undefined) {
        this.url$.next(value || "");
    }

    private readonly settingsService: SettingsService = inject(SettingsService);
    
    private url$ = new BehaviorSubject<string>("");
    private blobUrlPrefix$ = this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix),
    );

    public pictureUrl$ = combineLatest([this.url$, this.blobUrlPrefix$]).pipe(
        map(([url, blobUrlPrefix]) => {
            if (url) {
                return `${blobUrlPrefix}${url}`;
            }
            return null;
        }),
    );
}
