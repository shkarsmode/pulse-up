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
        },
      ],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
