import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { map } from "rxjs";
import { AppRoutes } from "../../enums/app-routes.enum";
import { BurgerButtonComponent } from "../ui-kit/buttons/burger-button/burger-button.component";

import { version } from "../../../../assets/data/version";
import { AuthenticationService } from "../../services/api/authentication.service";
import { SettingsService } from "../../services/api/settings.service";
import { PlatformService } from "../../services/core/platform.service";
import { WINDOW } from '../../tokens/window.token';
import { OpenGetAppPopupDirective } from "../popups/get-app-popup/open-get-app-popup.directive";
import { SecondaryButtonComponent } from "../ui-kit/buttons/secondary-button/secondary-button.component";
import { DownloadAppButtonComponent } from "./download-app-button/download-app-button.component";
import { DropdownLinkComponent } from "./dropdown-link/dropdown-link.component";
import { ProfileButtonComponent } from "./profile-button/profile-button.component";

@Component({
    selector: "app-header",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SvgIconComponent,
        BurgerButtonComponent,
        FormsModule,
        OpenGetAppPopupDirective,
        DownloadAppButtonComponent,
        SecondaryButtonComponent,
        DropdownLinkComponent,
        ProfileButtonComponent,
    ],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
    private platformService = inject(PlatformService);
    private settingsService = inject(SettingsService);
    private authService = inject(AuthenticationService);
    private readonly isWin = inject(WINDOW);

    public isMobileDropdown = false;
    public AppRoutes = AppRoutes;
    public version: { major: number; minor: number; patch: number };
    public isToShowVersionOfApp = false;
    public onlineStoreLink$ = this.settingsService.settings$.pipe(
        map((settings) => {
            if (this.platformService.value == "iOS") {
                return settings.appStoreUrl;
            } else {
                return settings.googlePlayUrl;
            }
        }),
    );

    constructor() {
        if (!this.isWin) return;
        this.isToShowVersionOfApp = !!localStorage.getItem("version");
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.getCurrentVersionOfApplication();
    }

    public get isAuthenticated() {
        return !!this.authService.userTokenValue;
    }

    public toggleDropdown(): void {
        this.isMobileDropdown = !this.isMobileDropdown;
        if (this.isMobileDropdown) {
            this.scrollToTop();
            this.disableDocumentScroll();
        } else this.enableDocumentScroll();
    }

    private disableDocumentScroll(): void {
        setTimeout(() => window.scrollTo(0, 0), 100);
        document.body.classList.add("no-scroll");
    }

    private enableDocumentScroll(): void {
        document.body.classList.remove("no-scroll");
    }

    public closeDropdown() {
        if (!this.isMobileDropdown) return;
        setTimeout(() => {
            this.isMobileDropdown = false;
            this.enableDocumentScroll();
        }, 150);
    }

    // @HostListener('window:scroll', [])
    // onScroll(): void {
    //     if(this.isMobileDropdown) this.closeDropdown();
    //     else return;
    // }

    public scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    private getCurrentVersionOfApplication(): void {
        this.version = version;
    }
}
