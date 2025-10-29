import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { TopicService } from "../../pages/topic/topic.service";

@Component({
    selector: "app-topic-end-date-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
    ],
    templateUrl: "./topic-end-date-form.component.html",
    styleUrls: ["./topic-end-date-form.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicEndDateFormComponent {
    private topicService = inject(TopicService);

    constructor() {
        effect(() => {
            const topic = this.topicService.topic();
            if (this.form.value.endDate) return;
            const topicEndDate = topic?.endsAt;
            if (topicEndDate) {
                this.form.patchValue({ endDate: new Date(topicEndDate) });
            }
        });
    }

    form = new FormGroup({
        endDate: new FormControl<Date | null>(null),
    });

    onApply() {
        const endDate = this.form.value.endDate;
        if (!endDate) return;
        console.log("Selected end date:", endDate);
        this.topicService.setTopicEndDate(new Date(endDate?.toISOString()));
        // Add your logic here (e.g. emit event or call a service)
    }
}
