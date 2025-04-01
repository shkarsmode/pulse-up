import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes.enum';
import { CommunityComponent } from './community.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { SupportComponent } from './support/support.component';
import { InvalidLinkComponent } from './invalid-link/invalid-link.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ChildSafetyComponent } from './child-safety/child-safety.component';

const routes: Routes = [
    {
        path: '',
        component: CommunityComponent ,
        children: [
            {
                path: AppRoutes.Community.PRIVACY,
                component: PrivacyComponent,
            },
            {
                path: AppRoutes.Community.TERMS,
                component: TermsComponent,
            },
            {
                path: AppRoutes.Community.SUPPORT,
                component: SupportComponent,
            },
            {
                path: AppRoutes.Community.INVALID_LINK,
                component: InvalidLinkComponent,
            },
            {
                path: AppRoutes.Community.CHILD_SAFETY,
                component: ChildSafetyComponent,
            },
            {
                path: AppRoutes.Community.NOT_FOUND,
                component: NotFoundComponent,
            },
            {
                path: '**',
                pathMatch: 'full',
                component: NotFoundComponent, 
            }
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
})
export class CommunityRoutingModule {}
