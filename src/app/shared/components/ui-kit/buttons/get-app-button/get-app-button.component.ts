import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { RippleEffectDirective } from '../../../../directives/ripple-effect';
import { AppLinksEnum } from '../../../../enums/app-links.enum';
import { PlatformService } from './../../../../services/core/platform.service';

@Component({
    selector: 'app-get-app-button',
    standalone: true,
    imports: [
        CommonModule,
        SvgIconComponent,
        RippleEffectDirective,
    ],
    templateUrl: './get-app-button.component.html',
    styleUrl: './get-app-button.component.scss'
})
export class GetAppButtonComponent {
    @Input() design: 'old' | 'new' = 'new';
    @Input() theme: 'light' | 'dark' = 'light';

    public platformService: PlatformService = inject(PlatformService);

    public links = AppLinksEnum;
    public platform = this.platformService.value == "iOS" ? "ios" : "android";

    public onClick(): void {
        if (this.platformService.value == "iOS") window.open(AppLinksEnum.APP_STORE);
        else window.open(AppLinksEnum.GOOGLE_APP_STORE);
    }

}
