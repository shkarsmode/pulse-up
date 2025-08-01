import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, filter, first, tap } from "rxjs";
import { SettingsService } from "../api/settings.service";

@Injectable({ providedIn: "root" })
export class AppInitializerService {
    private readonly settingsService = inject(SettingsService);

    private initialized = new BehaviorSubject<boolean>(false);
    public initialized$ = this.initialized.asObservable();

    public loadInitialData(): void {
        if (this.initialized.value) {
            return;
        }
        this.getInitialData();
    }

    private getInitialData() {
        this.settingsService.updateSettings();
        this.settingsService.loaded$
            .pipe(
                filter((loaded) => loaded),
                first(),
                tap(() => this.initialized.next(true)),
            )
            .subscribe({
                error: (err) => {
                    console.error("Failed to load initial data", err);
                    this.initialized.next(false);
                },
            });
    }
}
