import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';

export const IsUserBeenHowItWorksKey = 'is_user_been_how_it_works';

@Component({
    selector: 'app-how-it-works',
    templateUrl: './how-it-works.component.html',
    styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent implements OnInit {
    public isUserBeenHere: boolean = true;
    public TopicRoutes = AppRoutes.User.Topic;
    private readonly router: Router = inject(Router);

    public ngOnInit(): void {
        this.determineIfUserHasAlreadyBeenToHowItWorks();
    }

    public updateStatusOfBeingHere(): void {
        localStorage.setItem(IsUserBeenHowItWorksKey, 'true');
    }

    private determineIfUserHasAlreadyBeenToHowItWorks(): void {
        this.isUserBeenHere = false;
        if (localStorage.getItem(IsUserBeenHowItWorksKey)) {
            this.router.navigateByUrl('/user/topic/suggest');
            this.isUserBeenHere = true;
        }
    }
}
