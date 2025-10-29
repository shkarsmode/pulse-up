import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, ViewChild } from "@angular/core";

@Component({
    selector: "app-pulse-description",
    standalone: true,
    imports: [],
    templateUrl: "./pulse-description.component.html",
    styleUrl: "./pulse-description.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulseDescriptionComponent {
    @Input() longDescription = "";
    @Input() shortDescription = "";

    @ViewChild("description", { static: false })
    set descriptionElement(el: ElementRef<HTMLDivElement> | undefined) {
        if (el) {
            this.description = el;
            this.checkIfDescriptionTruncated();
        }
    }
    private description?: ElementRef<HTMLDivElement>;

    public isCollapsed = signal(false);

    public toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }

    private checkIfDescriptionTruncated(): void {
        const textElement = this.description?.nativeElement;
        if (!textElement) return;

        const fullHeight = textElement.scrollHeight;
        const visibleHeight = textElement.clientHeight;
        const heightDiff = fullHeight - visibleHeight;
        const isTruncated = heightDiff > 28; // 28px is approx. height of 2 lines of text

        this.isCollapsed.set(isTruncated);
    }
}
