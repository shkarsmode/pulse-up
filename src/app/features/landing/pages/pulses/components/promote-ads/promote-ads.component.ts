import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
    selector: 'app-promote-ads',
    templateUrl: './promote-ads.component.html',
    styleUrl: './promote-ads.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, PrimaryButtonComponent, RouterModule],
})
export class PromoteAdsComponent {
    public suggestRoute = "/" + AppRoutes.User.Topic.SUGGEST;
}
