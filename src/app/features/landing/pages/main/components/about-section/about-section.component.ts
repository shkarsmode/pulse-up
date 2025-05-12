import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { Colors } from "@/app/shared/enums/colors.enum";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-about-section",
    templateUrl: "./about-section.component.html",
    styleUrl: "./about-section.component.scss",
    standalone: true,
    imports: [RouterModule, SecondaryButtonComponent],
})
export class AboutSectionComponent {
    public isShowMore: boolean = false;
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;
}
