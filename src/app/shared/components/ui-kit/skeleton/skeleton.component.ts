import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
    selector: "app-skeleton",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./skeleton.component.html",
    styleUrls: ["./skeleton.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger("fade", [
            transition(":enter", [
                style({ opacity: 0 }),
                animate("180ms ease-out", style({ opacity: 1 })),
            ]),
            transition(":leave", [animate("220ms ease-in", style({ opacity: 0 }))]),
        ]),
    ],
})
export class SkeletonComponent {
    @Input() height = "16px";
    @Input() radius = "10px";
    @Input() ariaLabel = "Loading";
}
