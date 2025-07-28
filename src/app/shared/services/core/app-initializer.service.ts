import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, filter, first, tap } from "rxjs";
import { SettingsService } from "../api/settings.service";
import { VotesService } from "../votes/votes.service";

@Injectable({ providedIn: "root" })
export class AppInitializerService {
    private readonly settingsService = inject(SettingsService);
    private readonly votesService = inject(VotesService);

    private initialized = new BehaviorSubject<boolean>(false);
    public initialized$ = this.initialized.asObservable();

    public loadInitialData({ isAuthenticatedUser }: { isAuthenticatedUser: boolean }): void {
        if (this.initialized.value) {
            return;
        }
        if (isAuthenticatedUser) {
            this.updateAuthUserData();
        } else {
            this.updateAnonymousUserData();
        }
    }

    public resetInitialization(): void {
        this.initialized.next(false);
    }

    private updateAuthUserData() {
        this.settingsService.updateSettings();
        this.votesService.updateVotes();
        combineLatest([this.settingsService.loaded$, this.votesService.loaded$])
            .pipe(
                filter(([settingsLoaded, votesLoaded]) => settingsLoaded && votesLoaded),
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
    private updateAnonymousUserData() {
        this.settingsService.updateSettings();
        this.votesService.clearVotes();
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
