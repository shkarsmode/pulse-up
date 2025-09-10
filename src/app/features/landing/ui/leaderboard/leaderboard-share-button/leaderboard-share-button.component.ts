import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { LeaderboardShareButtonService } from "./leaderboard-share-button.service";

@Component({
    selector: "app-leaderboard-share-button",
    standalone: true,
    imports: [
        MatButtonModule,
        MenuComponent,
        AngularSvgIconModule,
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
    ],
    templateUrl: "./leaderboard-share-button.component.html",
    styleUrl: "./leaderboard-share-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardShareButtonComponent {
    private leaderboardShareButtonService = inject(LeaderboardShareButtonService);

    public pageUrl = this.leaderboardShareButtonService.shareUrl;

    public onCopyLink(event: MouseEvent): void {
        event.stopPropagation();
    }
}
