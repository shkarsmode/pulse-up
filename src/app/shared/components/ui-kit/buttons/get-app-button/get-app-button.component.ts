import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

    public links = AppLinksEnum;

    constructor(
        public platformService: PlatformService,
    ) { }

    public onClick(): void {
        if (this.platformService.value == "iOS") window.open(AppLinksEnum.APP_STORE);
        else window.open(AppLinksEnum.GOOGLE_APP_STORE);

    }

}
