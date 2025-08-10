import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AngularSvgIconModule } from "angular-svg-icon";
import { AppRoutes } from '@/app//shared/enums/app-routes.enum';
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

@Component({
    selector: 'app-how-it-works',
    templateUrl: './how-it-works.component.html',
    styleUrl: './how-it-works.component.scss',
    standalone: true,
    imports: [RouterModule, AngularSvgIconModule, PrimaryButtonComponent],
})
export class HowItWorksComponent {
    public TopicRoutes = AppRoutes.User.Topic;
}
