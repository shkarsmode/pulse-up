import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { version } from '../../../../assets/data/version';
import { AppRoutes } from '../../enums/app-routes.enum';
import { WINDOW } from '../../tokens/window.token';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterModule, SvgIconComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly isWin = inject(WINDOW);
    public version: { major: number; minor: number; patch: number };
    public CommunityRoutes = AppRoutes.Community;
    public isToShowVersionOfApp = false;

    constructor () {
        if (!this.isWin) return;
        this.isToShowVersionOfApp = !!localStorage.getItem("version");
    }

    public ngOnInit(): void {
        this.getCurrentVersionOfApplication();
    }

    private getCurrentVersionOfApplication(): void {
        this.version = version;
    }
}
