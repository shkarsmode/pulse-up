import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonModule } from "@angular/material/button";
import { DevSettingsService } from "../../services/core/dev-settings.service";
import { MaterialModule } from "../../modules/material.module";

@Component({
    selector: "app-dev-menu",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatExpansionModule, MatButtonModule, MaterialModule],
    templateUrl: "./dev-menu.component.html",
    styleUrls: ["./dev-menu.component.scss"],
})
export class DevMenuComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly devSettings = inject(DevSettingsService);

    readonly isOpen = signal(false);

    readonly locationForm = this.formBuilder.group({
        lat: [""],
        lng: [""],
        accuracy: [""],
    });

    toggleMenu() {
        this.isOpen.update(v => !v);
    }

    save() {
        this.devSettings.mockLocation = {
            latitude: parseFloat(this.locationForm.value.lat || "0"),
            longitude: parseFloat(this.locationForm.value.lng || "0"),
            accuracy: parseFloat(this.locationForm.value.accuracy || "100"),
        };
        this.locationForm.reset();
        this.toggleMenu();
    }
}
