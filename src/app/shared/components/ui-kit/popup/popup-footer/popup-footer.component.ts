import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-popup-footer",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./popup-footer.component.html",
    styleUrl: "./popup-footer.component.scss",
})
export class PopupFooterComponent {
    @Input() align: "left" | "right" | "center" = "center";
    @Input() gap: number = 16;

    styles = {};

    ngOnInit() {
        this.styles = {
            "justify-content":
                this.align === "left"
                    ? "flex-start"
                    : this.align === "right"
                    ? "flex-end"
                    : "center",
            "column-gap": `${this.gap}px`,
        };
    }
}
