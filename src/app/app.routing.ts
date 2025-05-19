import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.LandingModule),
    },

    {
        path: 'user',
        loadChildren: () => import('./features').then((m) => m.UserModule)
    },

    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.AuthModule)
    },

    {
        path: '',
        loadChildren: () => import('./features').then((m) => m.CommunityModule)
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
