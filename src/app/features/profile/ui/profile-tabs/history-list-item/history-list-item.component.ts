import { Component, Input } from "@angular/core";
import { ITopic } from "@/app/shared/interfaces";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { TimeFromNowPipe } from "@/app/shared/pipes/time-from-now.pipe";

@Component({
    selector: "app-history-list-item",
    standalone: true,
    imports: [
        LargePulseComponent,
        LargePulseIconComponent,
        LargePulseTitleComponent,
        LargePulseMetaComponent,
        TimeFromNowPipe,
    ],
    templateUrl: "./history-list-item.component.html",
    styleUrl: "./history-list-item.component.scss",
})
export class HistoryListItemComponent {
    @Input({ required: true }) data: ITopic;
    @Input({ required: true }) vote: IVote;
}
