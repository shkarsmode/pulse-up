import { environment } from "@/environments/environment";
import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { DevSettingsService } from "../../services/core/dev-settings.service";
import { GlobeSettingsService } from "../../services/map/globe-settings.service";

@Component({
    selector: "app-dev-menu",
    standalone: true,
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatLabel,
        MatExpansionModule,
        MatButtonModule,
        MatSliderModule,
        MatSlideToggleModule,
    ],
    templateUrl: "./dev-menu.component.html",
    styleUrls: ["./dev-menu.component.scss"],
})
export class DevMenuComponent {
    private readonly formBuilder = inject(FormBuilder);
    public readonly devSettings = inject(DevSettingsService);
    public readonly globeSettings = inject(GlobeSettingsService);

    public locationForm: FormGroup;
    readonly isOpen = signal(false);

    constructor() {
        const lat = 35.167406;
        const lng = 33.435499;
        this.locationForm = this.formBuilder.group({
            lat: [lat],
            lng: [lng],
            accuracy: ["100"],
        });
    }

    private ensureOverride() {
        if (!this.devSettings.markerSizingOverride) {
            this.devSettings.markerSizingOverride = { globe: {}, mercator: {} };
        }
    }

    getSizingValue(isGlobe: boolean, key: keyof (typeof environment.markerSizing.globe)) {
        const side = isGlobe ? "globe" : "mercator";
        const override = this.devSettings.markerSizingOverride?.[side as "globe" | "mercator"] as any;
        if (override && typeof override[key] !== "undefined") return override[key];
        return (environment.markerSizing as any)[side][key];
    }

    setSizingValue(isGlobe: boolean, key: keyof (typeof environment.markerSizing.globe), value: number) {
        this.ensureOverride();
        const side = isGlobe ? "globe" : "mercator";
        const cur = this.devSettings.markerSizingOverride || { globe: {}, mercator: {} };
        // @ts-ignore
        const part = { ...(cur as any)[side] } || {};
        part[key] = Number(value);
        (cur as any)[side] = part;
        this.devSettings.markerSizingOverride = cur;
    }

    toggleMenu() {
        this.isOpen.update((value) => !value);
    }

    save() {
        this.devSettings.mockLocation = {
            latitude: parseFloat(this.locationForm.value.lat || "0"),
            longitude: parseFloat(this.locationForm.value.lng || "0"),
            accuracy: parseFloat(this.locationForm.value.accuracy || "100"),
        };
        this.toggleMenu();
    }

    setAccentColor(hex: string) {
        this.applyAccentToDocument(hex);
    }

    resetAccentColor() {
        const root = document.documentElement;
        root.style.removeProperty("--accent-color");
        root.style.removeProperty("--accent-foreground");
        root.classList.remove("dev-accent-override");
    }

    private applyAccentToDocument(hex: string) {
        const root = document.documentElement;
        const fg = this.getReadableForeground(hex);
        root.style.setProperty("--accent-color", hex);
        root.style.setProperty("--accent-foreground", fg);
        root.classList.add("dev-accent-override");
    }

    private getReadableForeground(hex: string) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return "#ffffff";
        const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
        return lum > 0.5 ? "#000000" : "#ffffff";
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const sanitized = hex.replace('#', '').trim();
        if (sanitized.length === 3) {
            const r = parseInt(sanitized[0] + sanitized[0], 16);
            const g = parseInt(sanitized[1] + sanitized[1], 16);
            const b = parseInt(sanitized[2] + sanitized[2], 16);
            return { r, g, b };
        }
        if (sanitized.length === 6) {
            const r = parseInt(sanitized.substring(0, 2), 16);
            const g = parseInt(sanitized.substring(2, 4), 16);
            const b = parseInt(sanitized.substring(4, 6), 16);
            return { r, g, b };
        }
        return null;
    }
}
