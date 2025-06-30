import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: "app-map-marker-icon",
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective, LoadImgPathDirective],
    templateUrl: "./map-marker-icon.component.html",
    styleUrl: "./map-marker-icon.component.scss",
})
export class MapMarkerIconComponent implements OnInit {
    @Input() icon: string = "";
    @Input() isAnimated: boolean = false;
    @Input() animationDelay: number = 0;
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
