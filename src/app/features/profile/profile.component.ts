import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
    selector: "app-profile",
    template: `
        <app-header />

        <div class="profile-page">
            <router-outlet></router-outlet>
        </div>

        <app-footer />
        <div id="recaptcha-container"></div>
    `,
    styleUrls: ["./profile.component.scss"],
    standalone: true,
    imports: [RouterOutlet, FooterComponent, HeaderComponent],
})
export class ProfileComponent {}
