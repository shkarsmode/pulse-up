import { Component } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { MyTopicsTabComponent } from "./my-topics-tab/my-topics-tab.component";
import { HistoryTabComponent } from "./history-tab/history-tab.component";

@Component({
    selector: "app-profile-tabs",
    standalone: true,
    imports: [MatTabsModule, MyTopicsTabComponent, HistoryTabComponent],
    templateUrl: "./profile-tabs.component.html",
    styleUrl: "./profile-tabs.component.scss",
})
export class ProfileTabsComponent {}
