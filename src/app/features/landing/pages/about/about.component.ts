import { Component } from "@angular/core";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { LandingPageLayoutComponent } from "../../ui/landing-page-layout/landing-page-layout.component";

@Component({
    selector: "app-about",
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.scss"],
    standalone: true,
    imports: [PrimaryButtonComponent, LandingPageLayoutComponent],
})
export class AboutComponent {}
