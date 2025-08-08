import { CommonModule } from "@angular/common";
import { Component, HostBinding, Input, ViewEncapsulation } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-large-pulse-metric",
    standalone: true,
    imports: [CommonModule, AngularSvgIconModule],
    templateUrl: "./large-pulse-metric.component.html",
    styleUrl: "./large-pulse-metric.component.scss",
    encapsulation: ViewEncapsulation.ShadowDom, // to avoid svg icons to be rendered wrongly
})
export class LargePulseMetricComponent {
    @Input({ required: true }) text: string;
    @Input() icon: string | null = null;
    @Input() label: string | null = null;
    @Input() accent = false;

    @HostBinding("class.accent")
    public get isAccent() {
        return this.accent;
    }
}
