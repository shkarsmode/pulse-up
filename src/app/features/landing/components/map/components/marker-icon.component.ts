import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";

@Component({
    selector: "app-marker-icon",
    templateUrl: "./marker-icon.component.html",
    styleUrls: ["./marker-icon.component.scss"],
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective, LoadImgPathDirective],
})
export class MarkerIconComponent {
    @Input() icon: string = "";
    @Input() isAnimated: boolean = false;
    @Input() animationDelay: number = 0;
}
