import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { SendTopicService } from '../../../../shared/services/topic/send-topic.service';
import { AngularSvgIconModule } from "angular-svg-icon";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: 'app-submitted',
    templateUrl: './submitted.component.html',
    styleUrl: './submitted.component.scss',
    standalone: true,
    imports: [RouterModule, AngularSvgIconModule, PrimaryButtonComponent, SecondaryButtonComponent],
})
export class SubmittedComponent implements OnInit {
    public routes = AppRoutes;

    private readonly router: Router = inject(Router);
    private readonly sendTopicService: SendTopicService =
        inject(SendTopicService);

    public ngOnInit(): void {
        this.redirectIfNoDataFound();
    }

    private redirectIfNoDataFound(): void {
        if (this.sendTopicService.resultId) return;
        this.router.navigateByUrl('/user/topic/suggest');
    }
}
