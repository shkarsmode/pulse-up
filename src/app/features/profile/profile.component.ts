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
    styles: `
        :host { 
            display: flex;
            flex-direction: column;
            height: 100%; 
            width: 100%;
        }
        .profile-page { flex: 1 1 auto; }
    `,
})
export class ProfileComponent {}
