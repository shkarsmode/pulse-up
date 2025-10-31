import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
    selector: "app-landing-page-layout",
    standalone: true,
    imports: [HeaderComponent, FooterComponent],
    templateUrl: "./landing-page-layout.component.html",
    styleUrl: "./landing-page-layout.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageLayoutComponent {}
