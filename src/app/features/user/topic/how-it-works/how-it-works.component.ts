import { Component } from '@angular/core';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';

@Component({
    selector: 'app-how-it-works',
    templateUrl: './how-it-works.component.html',
    styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
    public TopicRoutes = AppRoutes.User.Topic;
}
