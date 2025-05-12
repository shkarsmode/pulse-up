import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { SendTopicService } from '../../../../shared/services/core/send-topic.service';

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
    public routes = AppRoutes.User.Topic;

    public userForm: FormGroup;

    private readonly sendTopicService: SendTopicService =
        inject(SendTopicService);

    public ngOnInit(): void {
        this.userForm = this.sendTopicService.userForm;
    }

    public onSubmitButtonClick(): void {
        this.sendTopicService.createTopic();
    }
}
