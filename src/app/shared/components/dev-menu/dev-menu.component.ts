import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
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
    ],
    templateUrl: "./dev-menu.component.html",
    styleUrls: ["./dev-menu.component.scss"],
})
export class DevMenuComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly devSettings = inject(DevSettingsService);
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
}
