import { inject, Injectable } from "@angular/core";
import { UserService } from "../services/api/user.service";
import { map } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class UserStore {
    private readonly userService: UserService = inject(UserService);

    public profile$ = this.userService.profile$;

    public hasPublicInformation$ = this.profile$.pipe(
        map((profile) => (profile ? !!(profile.name && profile.username) : false)),
    );

    public refreshProfile(): void {
        this.userService.refreshProfile();
    }
}