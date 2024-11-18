import { Component, inject, OnInit } from '@angular/core';
import { SendTopicService } from '../../../../shared/services/core/send-topic.service';

@Component({
    selector: 'app-contact-info',
    templateUrl: './contact-info.component.html',
    styleUrl: './contact-info.component.scss',
})
export class ContactInfoComponent implements OnInit {
    public readonly sendTopicService: SendTopicService = inject(SendTopicService);

    public ngOnInit(): void {
        window.scrollTo(0, 0);
    }
}
