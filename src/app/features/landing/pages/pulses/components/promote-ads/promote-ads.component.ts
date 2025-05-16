import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { AddTopicPopupDirective } from '@/app/shared/components/popups/add-topic-popup/add-topic-popup.directive';

@Component({
    selector: 'app-promote-ads',
    templateUrl: './promote-ads.component.html',
    styleUrl: './promote-ads.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PrimaryButtonComponent, AddTopicPopupDirective],
})
export class PromoteAdsComponent {}
