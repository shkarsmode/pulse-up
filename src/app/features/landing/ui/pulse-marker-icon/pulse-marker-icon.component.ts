import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";

@Component({
    selector: "app-pulse-marker-icon",
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective],
    templateUrl: "./pulse-marker-icon.component.html",
    styleUrl: "./pulse-marker-icon.component.scss",
})
export class PulseMarkerIconComponent implements OnInit {
    @Input() icon = "";
    @Input() isAnimated = false;
    @Input() animationDelay = 0;
    @Output() imageLoaded: EventEmitter<void> = new EventEmitter<void>();

    public classes = {};

    ngOnInit() {
        this.classes = {
            "marker-icon": true,
            "marker-icon--animated": this.isAnimated,
        };
    }

    public onImageLoaded(): void {
        this.imageLoaded.emit();
    }
}
