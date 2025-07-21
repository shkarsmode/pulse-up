import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonModule } from "@angular/material/button";
import { DevSettingsService } from "../../services/core/dev-settings.service";
import { MaterialModule } from "../../modules/material.module";

@Component({
    selector: "app-dev-menu",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatButtonModule,
        MaterialModule,
    ],
    templateUrl: "./dev-menu.component.html",
    styleUrls: ["./dev-menu.component.scss"],
})
export class DevMenuComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly devSettings = inject(DevSettingsService);

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
