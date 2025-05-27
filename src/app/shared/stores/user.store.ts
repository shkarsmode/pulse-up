import { inject, Injectable } from "@angular/core";
import { IProfile } from "../interfaces";
import { BehaviorSubject, first, switchMap, throwError } from "rxjs";
import { UserService } from "../services/api/user.service";

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly userService: UserService = inject(UserService);

  private profile: BehaviorSubject<IProfile | null> = new BehaviorSubject<IProfile | null>(null);

  public profile$ = this.profile.asObservable();

  public fetchOwnProfile() {
    this.userService
      .getOwnProfile()
      .pipe(
        first(),
        switchMap((profile) => {
          if(!profile) {
            throwError(() => new Error('Profile not found'));
          }
          return this.userService.getProfileById(profile.id);
        })
      )
      .subscribe({
      next: (profile) => {
        this.profile.next(profile);
      },
      error: (error) => {
        console.error('Failed to fetch own profile:', error);
        this.profile.next(null);
      }
    });
  }
}