import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";

const LOGO_SIZES = {
    lg: 140,
    md: 80,
};

@Component({
    selector: "app-large-pulse-icon",
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective],
    templateUrl: "./large-pulse-icon.component.html",
    styleUrl: "./large-pulse-icon.component.scss",
})
export class LargePulseIconComponent {
    @Input({ required: true }) src: string = "";
    @Input({ required: true }) size: keyof typeof LOGO_SIZES = "lg";
    @Input() label: string = "";

    public get width() {
        return LOGO_SIZES[this.size];
    }
    public get height() {
        return LOGO_SIZES[this.size];
    }
    public get class() {
        return `icon icon--${this.size}`;
    }
}
