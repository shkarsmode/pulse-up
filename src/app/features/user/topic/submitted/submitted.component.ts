import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { SendTopicService } from '../../../../shared/services/core/send-topic.service';

@Component({
    selector: 'app-submitted',
    templateUrl: './submitted.component.html',
    styleUrl: './submitted.component.scss',
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
