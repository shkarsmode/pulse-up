import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-user-avatar",
    templateUrl: "./user-avatar.component.html",
    styleUrl: "./user-avatar.component.scss",
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
})
export class UserAvatarComponent {
    @Input() public url?: string = "";
    @Input() public name: string = "";
    @Input() public size: number = 80;

    private readonly settingsService: SettingsService = inject(SettingsService);

    public get pictureUrl(): string | null {
        return this.url ? this.settingsService.blobUrlPrefix + this.url : null;
    }

    public style = {
        "width.px": this.size,
        "height.px": this.size,
    };

    ngOnInit() {
      console.log({size: this.size});
      
        this.style = {
            "width.px": this.size,
            "height.px": this.size,
        };
    }
}
