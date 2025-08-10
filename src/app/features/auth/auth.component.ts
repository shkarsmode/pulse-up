import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "app-auth",
    template: `
        <div class="page">
            <router-outlet></router-outlet>
            <div id="recaptcha-container"></div>
        </div>
    `,
    standalone: true,
    imports: [RouterOutlet],
})
export class AuthComponent { }
