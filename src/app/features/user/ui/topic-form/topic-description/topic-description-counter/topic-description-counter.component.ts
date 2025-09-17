import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import {
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
} from "@/app/features/user/helpers/error-message-builder";

@Component({
    selector: "app-topic-description-counter",
    standalone: true,
    imports: [],
    templateUrl: "./topic-description-counter.component.html",
    styleUrl: "./topic-description-counter.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicDescriptionCounterComponent {
    length = input<number>(0);

    private readonly minLength = MIN_DESCRIPTION_LENGTH;
    private readonly maxLength = MAX_DESCRIPTION_LENGTH;

    public content = computed(() => {
        const length = this.length();
        return length > 0 ? `${length}/${this.maxLength}` : `min: ${this.minLength}`;
    });
}
