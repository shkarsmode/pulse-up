import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { SubmittedComponent } from "./submitted/submitted.component";
import { SuggestComponent } from "./suggest/suggest.component";
import { TopicComponent } from "./topic.component";
import { PrivatePageGuard } from "@/app/shared/helpers/guards/private-page.guard";
import { SuggestGuard } from "../guards/suggest.guard";
import { PickLocationComponent } from "./pick-location/pick-location.component";
import { HowItWorksGuard } from "../guards/how-it-works.guard";
import { TopicPreviewComponent } from "./topic-preview/topic-preview.component";
import { CreateTopicGuard } from "../guards/create-topic.guard";
import { PreviewTopicCanActiveGuard } from "../guards/preview-topic-can-active.guard";
import { PreviewTopicCanDeactiveGuard } from "../guards/preview-topic-can-deactive.guard";
import { RequiredPersonalInformationGuard } from "../guards/required-personal-information.guard";

const routes: Routes = [
    {
        path: "",
        component: TopicComponent,
        children: [
            {
                path: "how-it-works",
                component: HowItWorksComponent,
                canActivate: [PrivatePageGuard, HowItWorksGuard],
                canDeactivate: [HowItWorksGuard],
            },
            {
                path: "suggest",
                component: SuggestComponent,
                canActivate: [
                    PrivatePageGuard,
                    SuggestGuard,
                    RequiredPersonalInformationGuard,
                    CreateTopicGuard,
                ],
            },
            {
                path: "preview",
                component: TopicPreviewComponent,
                canActivate: [PrivatePageGuard, PreviewTopicCanActiveGuard],
                canDeactivate: [PreviewTopicCanDeactiveGuard],
            },
            {
                path: "submitted",
                component: SubmittedComponent,
                canActivate: [PrivatePageGuard],
            },
            {
                path: "pick-location",
                component: PickLocationComponent,
                canActivate: [PrivatePageGuard],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TopicRoutingModule {}
