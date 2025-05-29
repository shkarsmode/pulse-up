import { Component, HostBinding, Input, OnChanges, SimpleChanges } from "@angular/core";
import { LogoComponent } from "./logo/logo.component";
import { trigger, state, style, transition, animate } from "@angular/animations";

@Component({
    selector: "app-loading-page",
    template: ` <app-logo></app-logo> `,
    styles: [
        `
            :host {
                width: 100dvw;
                height: 100%;

                position: fixed;
                display: flex;
                justify-content: center;
                align-items: center;

                background-color: white;

                z-index: 110;
            }
        `,
    ],
    animations: [
        trigger("fade", [
            state("visible", style({ opacity: 1 })),
            state("hidden", style({ opacity: 0 })),
            transition("visible <=> hidden", [animate("0.25s ease")]),
        ]),
    ],
    standalone: true,
    imports: [LogoComponent],
})
export class LoadingPageComponent implements OnChanges {
    @Input() isVisible: boolean = true;

    @HostBinding("@fade") get fadeAnimation() {
        return this.isVisible ? "visible" : "hidden";
    }

    @HostBinding("style.pointerEvents") pointerEvents = "auto";
    @HostBinding("style.visibility") visibility = "visible";
    @HostBinding("style.zIndex") zIndex = "110";

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["isVisible"]) {
            if (!this.isVisible) {
                setTimeout(() => {
                    this.pointerEvents = "none";
                    this.visibility = "hidden";
                    this.zIndex = "-1";
                }, 250);
            } else {
                this.pointerEvents = "auto";
                this.visibility = "visible";
                this.zIndex = "110";
            }
        }
    }
}
