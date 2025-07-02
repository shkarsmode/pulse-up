import { inject, Injectable, DestroyRef } from "@angular/core";
import { BehaviorSubject, switchMap, of, tap, map, filter, firstValueFrom } from "rxjs";
import { IProfile } from "../interfaces";
import { AuthenticationService } from "../services/api/authentication.service";
import { UserService } from "../services/api/user.service";
import { Nullable } from "../types";

@Injectable({ providedIn: "root" })
export class ProfileStore {
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthenticationService);
    private userService = inject(UserService);

    private profileSubject = new BehaviorSubject<Nullable<IProfile>>(null);
    profile$ = this.profileSubject.asObservable();
    hasPublicInformation$ = this.profile$.pipe(
        filter((profile) => !!profile),
        map((profile) => !!(profile.name && profile.username)),
    );

    refreshProfile() {
        return this.authService.user$.pipe(
            filter((user) => user !== undefined),
            switchMap((user) => {
                return this.fetchProfile();
            }),
            tap((profile) => this.profileSubject.next(profile)),
        )
    }

    updateProfile(data: IProfile) {
        return this.userService
            .updateOwnProfile(data)
            .pipe(tap((profile) => this.profileSubject.next(profile)));
    }

    async init(): Promise<void> {
        await firstValueFrom(this.refreshProfile());
    }

    private fetchProfile() {
        return this.userService.getOwnProfile();
    }
}
