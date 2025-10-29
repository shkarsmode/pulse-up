import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-topic-section",
    standalone: true,
    imports: [],
    templateUrl: "./topic-section.component.html",
    styleUrl: "./topic-section.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSectionComponent {}
