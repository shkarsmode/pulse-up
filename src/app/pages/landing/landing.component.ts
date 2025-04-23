import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
})
export class LandingComponent {
    showFooter = true;

    constructor(private router: Router) {}

    ngOnInit() {
        if (this.router.url.includes('/map')) {
            this.showFooter = false;
        }
    }
}
