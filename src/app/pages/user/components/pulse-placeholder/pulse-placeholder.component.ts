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
    public selectedPicture: string | ArrayBuffer | null;

    private readonly router: Router = inject(Router);
    private readonly sendTopicService: SendTopicService =
        inject(SendTopicService);

    public ngOnInit(): void {
        this.redirectIfNoDataFound();
        this.updateSelectedFiles();
    }

    public updateSelectedFiles(): void {
        const fileIcon = this.sendTopicService.currentTopic.get('icon')?.value;
        const filePicture = this.sendTopicService.currentTopic.get('picture')?.value;

        if (fileIcon) {
            const reader = new FileReader();

            reader.onload = () => (this.selectedIcon = reader.result);
            reader.readAsDataURL(fileIcon);
        }

        if (filePicture) {
            const reader = new FileReader();

            reader.onload = () => (this.selectedPicture = reader.result);
            reader.readAsDataURL(filePicture);
        }
    }

    private redirectIfNoDataFound(): void {
        if (this.sendTopicService.currentTopic.valid) return;
        this.router.navigateByUrl('/user/topic/suggest');
    }
}
