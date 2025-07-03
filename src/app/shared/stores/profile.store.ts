import { inject, Injectable, DestroyRef } from "@angular/core";
import { BehaviorSubject, tap, map, filter, take } from "rxjs";
import { IProfile } from "../interfaces";
import { AuthenticationService } from "../services/api/authentication.service";
import { UserService } from "../services/api/user.service";
import { Nullable } from "../types";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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

    constructor() {
        this.authService.user$
            .pipe(
                tap((user) => {
                    if (user) {
                        console.log("refreshProfile for user", user);
                        this.refreshProfile();
                    } else {
                        this.profileSubject.next(null);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
        this.refreshProfile().subscribe();
    }

    updateProfile(data: IProfile) {
        return this.userService
            .updateOwnProfile(data)
            .pipe(tap((profile) => this.profileSubject.next(profile)));
    }

    public refreshProfile() {
        return this.userService.getOwnProfile().pipe(
            take(1),
            tap((profile) => this.profileSubject.next(profile)),
        );
    }
}
