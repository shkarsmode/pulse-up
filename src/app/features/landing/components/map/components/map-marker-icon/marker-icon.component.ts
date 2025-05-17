import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";

@Component({
    selector: "app-marker-icon",
    templateUrl: "./marker-icon.component.html",
    styleUrls: ["./marker-icon.component.scss"],
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective, LoadImgPathDirective],
})
export class MarkerIconComponent implements OnInit {
    @Input() icon: string = "";
    @Input() isAnimated: boolean = false;
    @Input() animationDelay: number = 0;
    @Output() imageLoaded: EventEmitter<void> = new EventEmitter<void>();

    public classes = {}

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
