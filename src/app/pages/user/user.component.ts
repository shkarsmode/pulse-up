import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-user',
    template: `
        <app-header />

        <div class="user-page">
            <router-outlet></router-outlet>
        </div>

        @if (isToShowFooter) {
            <app-footer />
        }
    `,
    styles: `
        :host { 
            display: flex;
            flex-direction: column;
            height: 100%; 
            width: 100%;
        }
        .user-page { flex: 1 1 auto; padding: 0 20px 30px 20px;}

        @media screen and (max-width: 650px) {.user-page { padding: 24px 20px }}
    `,
})
export class UserComponent implements OnInit {
    public isToShowFooter: boolean = true;
    private readonly route: ActivatedRoute = inject(ActivatedRoute);

    public ngOnInit(): void {
        this.initRouteListenerToChangeFooterVisibility();
    }

    private initRouteListenerToChangeFooterVisibility(): void {
        this.route.data.subscribe(() => {
            console.log(window.location.pathname)
            this.isToShowFooter = true;
            if (window.location.pathname.includes('/user/topic'))
                this.isToShowFooter = false;
        });
    }
}
