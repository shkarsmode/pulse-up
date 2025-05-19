import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GetAppButtonComponent } from "@/app/shared/components/ui-kit/buttons/get-app-button/get-app-button.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";

@Component({
    selector: "app-mobile-app-banner",
    standalone: true,
    imports: [CommonModule, GetAppButtonComponent, ContainerComponent],
    templateUrl: "./mobile-app-banner.component.html",
    styleUrl: "./mobile-app-banner.component.scss",
})
export class MobileAppBannerComponent implements OnInit, OnChanges {
    @Input() visible: boolean = true;

    public classes = {};

    ngOnInit(): void {
        console.log("visible", this.visible);

        this.classes = {
            "mobile-app-banner": true,
            "mobile-app-banner--visible": this.visible,
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["visible"]) {
            this.updateClasses();
        }
    }

    private updateClasses(): void {
      console.log("visible", this.visible);
      
        this.classes = {
            "mobile-app-banner": true,
            "mobile-app-banner--visible": this.visible,
        };
    }
}
