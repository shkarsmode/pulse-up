import { Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { ITopic } from "../../../interfaces";

@Component({
    selector: "app-large-pulse",
    templateUrl: "./large-pulse.component.html",
    styleUrl: "./large-pulse.component.scss",
    standalone: true,
    imports: [CommonModule, RouterModule, SvgIconComponent],
})
export class LargePulseComponent {
    @Input() public pulse: ITopic;
    @Input() public showArrow = true;
    @Input() public showTopBadge = false;
}
