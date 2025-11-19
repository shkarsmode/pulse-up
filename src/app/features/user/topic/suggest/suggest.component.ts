import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
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
    private readonly activatedRoute = inject(ActivatedRoute);
    
    public routes = AppRoutes.User.Topic;
    public isEditMode = false;


    public ngOnInit(): void {
        setTimeout(() => window.scrollTo(0, 0))
        this.isEditMode = !!this.activatedRoute.snapshot.paramMap.get("id");
    }

    public onSubmit(): void {
        this.router.navigateByUrl(this.routes.PREVIEW);
    }
}
