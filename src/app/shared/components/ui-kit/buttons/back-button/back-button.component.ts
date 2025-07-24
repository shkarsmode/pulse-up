import { Component } from "@angular/core";
import { SecondaryButtonComponent } from "../secondary-button/secondary-button.component";

@Component({
    selector: "app-back-button",
    standalone: true,
    imports: [SecondaryButtonComponent],
    templateUrl: "./back-button.component.html",
    styleUrl: "./back-button.component.scss",
})
export class BackButtonComponent {
    public backToPulsePage(): void {
        window.history.go(-1);
    }
}
