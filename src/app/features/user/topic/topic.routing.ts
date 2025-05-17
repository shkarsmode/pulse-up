import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { SubmittedComponent } from './submitted/submitted.component';
import { SuggestComponent } from './suggest/suggest.component';
import { TopicComponent } from './topic.component';

const routes: Routes = [
    {
        path: '',
        component: TopicComponent,
        children: [
            {
                path: 'how-it-works',
                component: HowItWorksComponent,
            },
            {
                path: 'suggest',
                component: SuggestComponent,
            },
            {
                path: 'contact-info',
                component: ContactInfoComponent,
            },
            {
                path: 'submitted',
                component: SubmittedComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TopicRoutingModule {}

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
