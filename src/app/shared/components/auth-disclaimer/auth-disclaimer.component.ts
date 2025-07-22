import { Component, EventEmitter, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppRoutes } from "../../enums/app-routes.enum";

@Component({
    selector: "app-auth-disclaimer",
    standalone: true,
    imports: [RouterLink],
    templateUrl: "./auth-disclaimer.component.html",
    styleUrl: "./auth-disclaimer.component.scss",
})
export class AuthDisclaimerComponent {
    @Output() openLink = new EventEmitter<void>();
    termsRoute = `/${AppRoutes.Community.TERMS}`;
    privacyRoute = `/${AppRoutes.Community.PRIVACY}`;

    onOpenLink() {
        this.openLink.emit();
    }
}
