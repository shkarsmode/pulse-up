import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-pulse-icon",
    standalone: true,
    imports: [AngularSvgIconModule],
    template: `
        <svg-icon
            src="assets/svg/pulse.svg"
            ariaLabel="pulse icon" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom, // to avoid svg icons to be rendered wrongly
})
export class PulseIconComponent {}
