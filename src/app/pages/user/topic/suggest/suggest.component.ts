import { Component, OnInit } from '@angular/core';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';

@Component({
    selector: 'app-suggest',
    templateUrl: './suggest.component.html',
    styleUrl: './suggest.component.scss',
})
export class SuggestComponent implements OnInit {
    public routes = AppRoutes.User.Topic;

    public ngOnInit(): void {
        window.scrollTo(0, 0);
    }
}
