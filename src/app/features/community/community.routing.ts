// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { AppRoutes } from '../../shared/enums/app-routes.enum';
// import { CommunityComponent } from './community.component';
// import { PrivacyComponent } from './privacy/privacy.component';
// import { TermsComponent } from './terms/terms.component';
// import { SupportComponent } from './support/support.component';
// import { InvalidLinkComponent } from './invalid-link/invalid-link.component';
// import { NotFoundComponent } from './not-found/not-found.component';
// import { ChildSafetyComponent } from './child-safety/child-safety.component';
// import { PublicPageGuard } from '@/app/shared/helpers/guards/public-page.guard';

// const routes: Routes = [
//     {
//         path: '',
//         component: CommunityComponent ,
//         children: [
//             {
//                 path: AppRoutes.Community.PRIVACY,
//                 component: PrivacyComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: AppRoutes.Community.TERMS,
//                 component: TermsComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: AppRoutes.Community.SUPPORT,
//                 component: SupportComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: AppRoutes.Community.INVALID_LINK,
//                 component: InvalidLinkComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: AppRoutes.Community.CHILD_SAFETY,
//                 component: ChildSafetyComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: AppRoutes.Community.NOT_FOUND,
//                 component: NotFoundComponent,
//                 canActivate: [PublicPageGuard],
//             },
//             {
//                 path: '**',
//                 pathMatch: 'full',
//                 component: NotFoundComponent, 
//                 canActivate: [PublicPageGuard],
//             }
//         ],
//     },
// ];

// @NgModule({
//     imports: [
//         RouterModule.forChild(routes),
//     ],
//     exports: [RouterModule],
// })
// export class CommunityRoutingModule {}
