import { Component, inject, OnInit } from '@angular/core';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { Router } from '@angular/router';
import { TopicFormComponent } from '../../ui/topic-form/topic-form.component';

@Component({
    selector: 'app-suggest',
    templateUrl: './suggest.component.html',
    styleUrl: './suggest.component.scss',
    standalone: true,
    imports: [TopicFormComponent],
})
export class SuggestComponent implements OnInit {
    private readonly router = inject(Router)
    public routes = AppRoutes.User.Topic;

    public ngOnInit(): void {
        setTimeout(() => window.scrollTo(0, 0))
    }

    public onSubmit(): void {
        this.router.navigateByUrl(this.routes.PREVIEW);
    }
}
