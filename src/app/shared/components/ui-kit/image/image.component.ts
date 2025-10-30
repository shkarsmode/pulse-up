import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    HostBinding,
    OnInit,
    signal,
} from "@angular/core";

@Component({
    selector: "app-image",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./image.component.html",
    styleUrls: ["./image.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent implements OnInit {
    @Input() src = "";
    @Input() alt = "";
    @Input() fallback = "";
    @Input() objectFit: "cover" | "contain" | "fill" | "none" | "scale-down" = "cover";
    /** width/height can be provided as CSS values (eg "100%", "200px") */
    @Input() width: string | null = null;
    @Input() height: string | null = null;
    @Input() lazy = true;
    @Input() fadeMs = 300;

    public isLoading = signal(true);
    public hasError = signal(false);
    public currentSrc = signal("");

    @HostBinding("style.width")
    get hostWidth() {
        return this.width || null;
    }

    @HostBinding("style.height")
    get hostHeight() {
        return this.height || null;
    }

    ngOnInit(): void {
        this.resetState();
        this.currentSrc.set(this.src);
        if (!this.src) {
            this.handleError();
        }
    }

    private resetState() {
        this.isLoading.set(true);
        this.hasError.set(false);
    }

    public onLoad() {
        this.isLoading.set(false);
        this.hasError.set(false);
    }

    public onError() {
        this.handleError();
    }

    private handleError() {
        if (this.fallback) {
            if (this.currentSrc() === this.fallback) {
                this.isLoading.set(false);
                this.hasError.set(true);
                return;
            }
            this.currentSrc.set(this.fallback);
            this.isLoading.set(true);
            this.hasError.set(false);
        } else {
            this.isLoading.set(false);
            this.hasError.set(true);
        }
    }
}
