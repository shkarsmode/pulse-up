import { Routes } from "@angular/router";
import { UserComponent } from "./user.component";

export const USER_ROUTES: Routes = [
    {
        path: "",
        component: UserComponent,
        children: [
            {
                path: "topic",
                loadChildren: () => import("./topic/topic.routes").then((m) => m.TOPIC_ROUTES),
            },
        ],
    },
];
