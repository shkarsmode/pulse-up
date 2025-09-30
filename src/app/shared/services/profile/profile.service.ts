import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { distinctUntilChanged, firstValueFrom, tap } from "rxjs";
import { UserService } from "../api/user.service";
import { IProfile } from "../../interfaces";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { AuthenticationService } from "../api/authentication.service";

@Injectable({ providedIn: "root" })
export class ProfileService {
    private destroyRef = inject(DestroyRef);
    private userService = inject(UserService);
    private authService = inject(AuthenticationService);

    private _profile = signal<IProfile | null>(null);
    public profile = this._profile.asReadonly();
    public profile$ = toObservable(this.profile);

    constructor() {
        this.loadProfile();

        this.authService.userToken.pipe(
            distinctUntilChanged(),
            tap((token) => {
                if (!token) {
                    this.clearProfile();
                }
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe()
    }

    public refreshProfile() {
        return this.loadProfile();
    }

    public async updateProfile(data: IProfile): Promise<IProfile> {
        const updatedProfile = await firstValueFrom(this.userService.updateOwnProfile(data));
        this._profile.set(updatedProfile);
        return updatedProfile;
    }

    public clearProfile() {
        this._profile.set(null);
    }

    private async loadProfile() {
        const profile = await firstValueFrom(this.userService.getOwnProfile());
        this._profile.set(profile);
        return profile;
    }
}
