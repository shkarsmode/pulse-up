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
            // this.checkIfDescriptionTruncated();
        }
    }
    private description?: ElementRef<HTMLDivElement>;

    public isCollapsed = signal(true);

    public toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }

    // private checkIfDescriptionTruncated(): void {
    //     const textElement = this.description?.nativeElement;
    //     if (!textElement) return;

    //     const fullHeight = textElement.scrollHeight;
    //     const visibleHeight = textElement.clientHeight + 2;
    //     const heightDiff = fullHeight - visibleHeight;
    //     const isTruncated = heightDiff > 19;

    //     this.isCollapsed.set(!isTruncated);
    // }
}
