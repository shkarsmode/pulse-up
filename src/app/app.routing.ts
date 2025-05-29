import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectPersonalInfoGuard } from './shared/helpers/guards/collect-personal-info.guard';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.LandingModule),
        canActivateChild: [CollectPersonalInfoGuard]
    },

    {
        path: 'user',
        loadChildren: () => import('./features').then((m) => m.UserModule),
        canActivateChild: [CollectPersonalInfoGuard]
    },

    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.AuthModule)
    },

    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.ProfileModule),
        canActivateChild: [CollectPersonalInfoGuard]
    },

    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.CommunityModule),
        canActivateChild: [CollectPersonalInfoGuard]
    },

];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            enableViewTransitions: true,
            anchorScrolling: 'enabled', 
            scrollPositionRestoration: "enabled", 
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
