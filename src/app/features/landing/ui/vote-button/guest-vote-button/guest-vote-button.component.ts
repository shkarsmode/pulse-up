import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { VotingService } from "@/app/shared/services/votes/voting.service";

@Component({
    selector: "app-guest-vote-button",
    standalone: true,
    imports: [PrimaryButtonComponent, AngularSvgIconModule],
    templateUrl: "./guest-vote-button.component.html",
    styleUrl: "./guest-vote-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestVoteButtonComponent {
    private votingService = inject(VotingService);
    
    public onClick() {
        this.votingService.startVotingForAnonymousUser();
    }
}
