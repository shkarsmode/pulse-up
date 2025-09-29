import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
    selector: "app-lending-page-layout",
    standalone: true,
    imports: [HeaderComponent, FooterComponent],
    templateUrl: "./lending-page-layout.component.html",
    styleUrl: "./lending-page-layout.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingPageLayoutComponent {}
