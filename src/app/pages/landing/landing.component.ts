import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
})
export class LandingComponent {
    public isToShowFooter: boolean = true;
    private readonly route: ActivatedRoute = inject(ActivatedRoute);

    public ngOnInit(): void {
        this.initRouteListenerToChangeFooterVisibility();
    }

    private initRouteListenerToChangeFooterVisibility(): void {
        this.route.data.subscribe(() => {
            this.isToShowFooter = true;
            if (window.location.pathname.includes('/map'))
                this.isToShowFooter = false;
        });
    }
}
