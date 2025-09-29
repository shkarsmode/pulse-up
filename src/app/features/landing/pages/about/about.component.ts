import { Component } from "@angular/core";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { LendingPageLayoutComponent } from "../../ui/lending-page-layout/lending-page-layout.component";

@Component({
    selector: "app-about",
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.scss"],
    standalone: true,
    imports: [PrimaryButtonComponent, LendingPageLayoutComponent],
})
export class AboutComponent {}
