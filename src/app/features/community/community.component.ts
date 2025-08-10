import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";
import { HeaderComponent } from "@/app/shared/components/header/header.component";

@Component({
    selector: "app-community",
    template: `
        <app-header />

        <div class="page">
            <router-outlet></router-outlet>
        </div>

        <app-footer />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .page {
            flex: 1 1 auto;
        }
    `,
    standalone: true,
    imports: [RouterOutlet, FooterComponent, HeaderComponent],
})
export class CommunityComponent {}
