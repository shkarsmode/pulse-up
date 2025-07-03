import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, of, switchMap, shareReplay, tap, filter, map } from "rxjs";
import { UserService } from "../api/user.service";
import { IProfile } from "../../interfaces";

@Injectable({ providedIn: "root" })
export class ProfileService {
    private readonly userService = inject(UserService);

    private readonly loadTrigger$ = new BehaviorSubject<void>(undefined);

    private cachedProfile: IProfile | null = null;

    readonly profile$: Observable<IProfile | null> = this.loadTrigger$.pipe(
        switchMap(() => {
            if (this.cachedProfile) return of(this.cachedProfile);

            return this.userService
                .getOwnProfile()
                .pipe(tap((profile) => (this.cachedProfile = profile)));
        }),
        shareReplay(1),
    );

    readonly hasPublicInformation$: Observable<boolean> = this.profile$.pipe(
        filter((profile) => !!profile),
        map((profile) => !!(profile.name && profile.username)),
    );

    invalidate(): void {
        this.cachedProfile = null;
        this.loadTrigger$.next();
    }

    refreshProfile(): Observable<IProfile | null> {
        return this.userService.getOwnProfile().pipe(
            tap((profile) => {
                this.cachedProfile = profile;
                this.loadTrigger$.next();
            }),
        );
    }
    updateProfile(data: IProfile): Observable<IProfile> {
        return this.userService.updateOwnProfile(data).pipe(
            tap(() => {
                this.cachedProfile = null;
                this.loadTrigger$.next();
            }),
        );
    }
}
