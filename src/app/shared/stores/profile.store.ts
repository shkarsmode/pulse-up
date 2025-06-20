import { inject, Injectable, DestroyRef } from "@angular/core";
import { BehaviorSubject, switchMap, of, tap, map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
        map((profile) => !!(profile?.name && profile?.username)),
    );

    constructor() {
        this.authService.userToken
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((token) => {
                    if (token) {
                        return this.fetchProfile();
                    } else {
                        return of(null);
                    }
                }),
                tap((profile) => this.profileSubject.next(profile)),
            )
            .subscribe();
    }

    public refreshProfile() {
        return this.fetchProfile().pipe(tap((profile) => this.profileSubject.next(profile)));
    }

    public updateProfile(data: IProfile) {
        return this.userService.updateOwnProfile(data).pipe(
            tap((profile) => this.profileSubject.next(profile)),
        );
    }

    private fetchProfile() {
        return this.userService.getOwnProfile();
    }
}
