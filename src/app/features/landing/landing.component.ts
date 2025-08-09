import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.component.html",
    styleUrl: "./landing.component.scss",
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class LandingComponent {}
