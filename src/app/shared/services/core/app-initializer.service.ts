import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, tap } from "rxjs";
import { SettingsService } from "../api/settings.service";
import { ISettings } from "../../interfaces";

interface IInitialData {
    settings: ISettings;
}

@Injectable({ providedIn: "root" })
export class AppInitializerService {
    private readonly settingsService: SettingsService = inject(SettingsService);
    private initialData = new BehaviorSubject<IInitialData | null>(null);
    public initialData$ = this.initialData.asObservable();
    public initialized = false;

    loadInitialData(): Observable<IInitialData | null> {
        if (this.initialized) {
            return this.initialData.asObservable();
        }
        return this.settingsService.getSettings().pipe(
            tap((data) => {
                this.initialData.next({
                    settings: data,
                });
                this.initialized = true;
            }),
            switchMap(() => this.initialData.asObservable()),
        );
    }
}
