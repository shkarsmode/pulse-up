import { Component } from "@angular/core";

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
})
export class ProfileComponent {}
