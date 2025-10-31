import { TopicExpirationSeverity } from "@/app/shared/interfaces";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-large-pulse-expiration-indicator",
    standalone: true,
    imports: [AngularSvgIconModule],
    templateUrl: "./large-pulse-expiration-indicator.component.html",
    styleUrl: "./large-pulse-expiration-indicator.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargePulseExpirationIndicatorComponent {
    @Input() severity: TopicExpirationSeverity;
}
