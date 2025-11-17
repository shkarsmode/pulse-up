import { PrivatePageGuard } from "@/app/shared/helpers/guards/private-page.guard";
import { Routes } from "@angular/router";
import { ActiveTopicsLimitGuard } from "../guards/active-topics-limit.guard";
import { CreateTopicGuard } from "../guards/create-topic.guard";
import { HowItWorksGuard } from "../guards/how-it-works.guard";
import { PreviewTopicCanActiveGuard } from "../guards/preview-topic-can-active.guard";
import { PreviewTopicCanDeactiveGuard } from "../guards/preview-topic-can-deactive.guard";
import { RequiredPersonalInformationGuard } from "../guards/required-personal-information.guard";
import { SuggestGuard } from "../guards/suggest.guard";
import { TopicComponent } from "./topic.component";

export const TOPIC_ROUTES: Routes = [
    {
        path: "",
        component: TopicComponent,
        children: [
            {
                path: "how-it-works",
                loadComponent: () =>
                    import("./how-it-works/how-it-works.component").then((m) => m.HowItWorksComponent),
                canActivate: [PrivatePageGuard, RequiredPersonalInformationGuard],
                canDeactivate: [HowItWorksGuard],
            },
            {
                path: "suggest/:id",
                loadComponent: () =>
                    import("./suggest/suggest.component").then((m) => m.SuggestComponent),
                canActivate: [
                    PrivatePageGuard,
                    SuggestGuard,
                    RequiredPersonalInformationGuard,
                    ActiveTopicsLimitGuard,
                    CreateTopicGuard,
                ],
            },
            {
                path: "suggest",
                loadComponent: () =>
                    import("./suggest/suggest.component").then((m) => m.SuggestComponent),
                canActivate: [
                    PrivatePageGuard,
                    SuggestGuard,
                    RequiredPersonalInformationGuard,
                    ActiveTopicsLimitGuard,
                    CreateTopicGuard,
                ],
            },
            {
                path: "preview",
                loadComponent: () =>
                    import("./topic-preview/topic-preview.component").then((m) => m.TopicPreviewComponent),
                canActivate: [PrivatePageGuard, PreviewTopicCanActiveGuard],
                canDeactivate: [PreviewTopicCanDeactiveGuard],
            },
            {
                path: "submitted",
                loadComponent: () =>
                    import("./submitted/submitted.component").then((m) => m.SubmittedComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "pick-location",
                loadComponent: () =>
                    import("./pick-location/pick-location.component").then((m) => m.PickLocationComponent),
                canActivate: [PrivatePageGuard],
            },
        ],
    },
];
