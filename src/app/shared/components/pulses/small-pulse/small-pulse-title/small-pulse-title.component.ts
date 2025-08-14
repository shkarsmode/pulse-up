import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-small-pulse-title",
    standalone: true,
    imports: [],
    templateUrl: "./small-pulse-title.component.html",
    styleUrl: "./small-pulse-title.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallPulseTitleComponent {}
