import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { VotingService } from "@/app/shared/services/votes/voting.service";
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { TopicService } from "../../../pages/topic/topic.service";

@Component({
    selector: "app-guest-vote-button",
    standalone: true,
    imports: [PrimaryButtonComponent, AngularSvgIconModule],
    templateUrl: "./guest-vote-button.component.html",
    styleUrl: "./guest-vote-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestVoteButtonComponent {
    @Input() public isLightBackground = false;
    private votingService = inject(VotingService);
    private topicService = inject(TopicService);
    
    public onClick() {
        this.votingService.startVotingForAnonymousUser();
        this.topicService.setAnonymousUserVotingInProgress(true);
    }
}
