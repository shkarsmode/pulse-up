import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-large-pulse-meta",
    standalone: true,
    imports: [AngularSvgIconModule],
    templateUrl: "./large-pulse-meta.component.html",
    styleUrl: "./large-pulse-meta.component.scss",
})
export class LargePulseMetaComponent {
    @Input({ required: true }) icon: string;
    @Input({ required: true }) label: string;
    @Input({ required: true }) text: string;
}
