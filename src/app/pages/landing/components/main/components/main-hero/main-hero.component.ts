import { Component, inject } from '@angular/core';
import { PlatformService } from '@/app/shared/services/core/platform.service';
import { AppLinksEnum } from '@/app/shared/enums/app-links.enum';

@Component({
    selector: 'app-main-hero',
    templateUrl: './main-hero.component.html',
    styleUrls: ['./main-hero.component.scss'],
})
export class MainHeroComponent {
    private readonly platformService: PlatformService = inject(PlatformService);
    public openStore(): void {
        console.log(this.platformService);
        
        if (this.platformService.value == 'iOS')
            window.open(AppLinksEnum.APP_STORE);
        else window.open(AppLinksEnum.GOOGLE_APP_STORE);
    }
}
