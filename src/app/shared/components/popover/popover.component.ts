import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { TippyDirective } from "@ngneat/helipopper";
import { TippyProps } from "@ngneat/helipopper/config";

@Component({
    selector: "app-popover",
    standalone: true,
    imports: [TippyDirective],
    templateUrl: "./popover.component.html",
    styleUrl: "./popover.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
    @Input() variation: "popper" | "tooltip" | "contextMenu" = "popper";
    @Input() trigger: "mouseenter" | "click" | "manual" = "mouseenter";
    @Input() placement: TippyProps["placement"] = "bottom";
    @Input() delay: number;
    @Input() tpIsVisible: boolean;
}
