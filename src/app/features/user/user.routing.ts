import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';

const routes: Routes = [
    {
      path: '',
      component: UserComponent,
      children: [
        {
          path: 'topic',
          loadChildren: () => import('./topic').then((m) => m.TopicModule)
        }
      ],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

/*     {
      path: UserRoutes.USER,
      pathMatch: 'full',
      redirectTo: UserRoutes.ProfileRoutes.PROFILE,
      
      children: [
        {
          path: 'new-topic',
          pathMatch: 'full',
          redirectTo: UserRoutes.NewTopicRoutes.HOW_IT_WORKS,
          children: [
            {
              path: UserRoutes.NewTopicRoutes.HOW_IT_WORKS,
              component: HowItWorksPageComponent,
            },
            {
              path: 'form',
              children: [
                {
                  path: UserRoutes.NewTopicRoutes.FORM.SUGGEST_TOPIC,
                  component: SuggestTopicPageComponent,
                },
                {
                  path: UserRoutes.NewTopicRoutes.FORM.CONTACT_INFO,
                  component: ContactInfoPageComponent
                },
                {
                  path: UserRoutes.NewTopicRoutes.FORM.SUBMIT_SUCSESS,
                  component: ContactInfoPageComponent
                },
              ]
            },

          ]
        }, 
        {
          path: UserRoutes.ProfileRoutes.PROFILE,
          pathMatch: 'full',
          redirectTo: UserRoutes.ProfileRoutes.PROFILE_STARTED,
          children: [
            {
              path: UserRoutes.ProfileRoutes.PROFILE_STARTED,
              component: ProfileStartedPageCompnent
            },
            {
              path: UserRoutes.ProfileRoutes.PROFILE_SUPPORTED,
              component: ProfileStartedPageCompnent
            }

          ]
        }
      ]
    }

  */