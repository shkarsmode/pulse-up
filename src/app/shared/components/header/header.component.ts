import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { AppRoutes } from '../../enums/app-routes.enum';
import { ComingSoonPopupDirective } from '../popups/comming-soon-popup/coming-soon-popup.directive';
import { BurgerButtonComponent } from '../ui-kit/buttons/burger-button/burger-button.component';
import { PrimaryButtonComponent } from '../ui-kit/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from "../ui-kit/buttons/secondary-button/secondary-button.component";

import { version } from '../../../../assets/data/version';
import { OpenGetAppPopupDirective } from '../popups/get-app-popup/open-get-app-popup.directive';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PrimaryButtonComponent,
        SvgIconComponent,
        BurgerButtonComponent,
        FormsModule,
        ComingSoonPopupDirective,
        SecondaryButtonComponent,
        OpenGetAppPopupDirective,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    public isMobileDropdown: boolean = false;
    public AppRoutes = AppRoutes;
    public version: { major: number; minor: number; patch: number };
    public isToShowVersionOfApp: boolean = !!localStorage.getItem('version');

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.getCurrentVersionOfApplication();
    }

    public toggleDropdown(): void {
        console.log('toggleDropdown')
        this.isMobileDropdown = !this.isMobileDropdown;
        if (this.isMobileDropdown) {
            this.scrollToTop();
            this.disableDocumentScroll();
        } else this.enableDocumentScroll();
    }

    private disableDocumentScroll(): void {
        setTimeout(() => window.scrollTo(0, 0), 100);
        document.body.classList.add('no-scroll');
    }

    private enableDocumentScroll(): void {
        document.body.classList.remove('no-scroll');
    }

    public deligateCloseDropdown(event: Event) {
        const targetElement = event.target as HTMLElement;

        // Check if the click occurred on an anchor tag (logo or menu links)
        if (targetElement.tagName === 'A') {
            this.isMobileDropdown = false;
            this.enableDocumentScroll();
        }
    }

    public closeDropdown() {
        if (!this.isMobileDropdown) return;
        this.isMobileDropdown = false;
        this.enableDocumentScroll();
    }

    // @HostListener('window:scroll', [])
    // onScroll(): void {
    //     if(this.isMobileDropdown) this.closeDropdown();
    //     else return;
    // }

    public scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    private getCurrentVersionOfApplication(): void {
        this.version = version;
    }
}
