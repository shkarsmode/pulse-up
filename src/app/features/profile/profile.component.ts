import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "app-user",
    template: `
        <app-header />

        <div class="profile-page">
            <router-outlet></router-outlet>
        </div>

        <app-footer />
    `,
    styles: `
        :host { 
            display: flex;
            flex-direction: column;
            height: 100%; 
            width: 100%;
        }
        .profile-page { flex: 1 1 auto; padding: 0 20px 30px 20px;}

        @media screen and (max-width: 650px) {.user-page { padding: 24px 20px }}
    `,
})
export class ProfileComponent {}
