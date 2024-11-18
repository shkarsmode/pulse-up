import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SendTopicService } from '../../../../shared/services/core/send-topic.service';

@Component({
    selector: 'app-pulse-placeholder',
    templateUrl: './pulse-placeholder.component.html',
    styleUrl: './pulse-placeholder.component.scss',
})
export class PulsePlaceholderComponent implements OnInit {
    @Input() public info: any;

    public selectedIcon: string | ArrayBuffer | null;

    private readonly router: Router = inject(Router);
    private readonly sendTopicService: SendTopicService =
        inject(SendTopicService);

    public ngOnInit(): void {
        this.redirectIfNoDataFound();
        this.updateSelectedIcon();
    }

    public updateSelectedIcon(): void {
        const file = this.sendTopicService.currentTopic.get('icon')?.value;

        if (file) {
            const reader = new FileReader();

            reader.onload = () => (this.selectedIcon = reader.result);
            reader.readAsDataURL(file);
        }
    }

    private redirectIfNoDataFound(): void {
        if (this.sendTopicService.currentTopic.valid) return;
        this.router.navigateByUrl('/user/topic/suggest');
    }
}
