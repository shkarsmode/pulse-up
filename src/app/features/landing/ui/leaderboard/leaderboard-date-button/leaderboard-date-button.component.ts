import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-leaderboard-date-button",
    standalone: true,
    imports: [SecondaryButtonComponent],
    templateUrl: "./leaderboard-date-button.component.html",
    styleUrl: "./leaderboard-date-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardDateButtonComponent {
    @Input() isActive = false;
    @Output() handleClick = new EventEmitter<void>();

    public onClick(): void {
        this.handleClick.emit();
    }
}
