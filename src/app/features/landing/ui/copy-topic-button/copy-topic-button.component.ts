import { Component, Input } from "@angular/core";
import { TippyDirective } from "@ngneat/helipopper";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatButtonModule } from "@angular/material/button";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-copy-topic-button",
    standalone: true,
    imports: [TippyDirective, MatButtonModule, AngularSvgIconModule, ClipboardModule],
    templateUrl: "./copy-topic-button.component.html",
    styleUrl: "./copy-topic-button.component.scss",
})
export class CopyTopicButtonComponent {
    @Input({ required: true }) topicUrl: string;

    public tooltipVisible = false;

    public onClick() {
        if (this.tooltipVisible) return;

        this.tooltipVisible = true;
        setTimeout(() => {
            this.tooltipVisible = false;
        }, 1500);
    }
}
