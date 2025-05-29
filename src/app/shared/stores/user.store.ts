import { inject, Injectable } from "@angular/core";
import { UserService } from "../services/api/user.service";

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly userService: UserService = inject(UserService);

  public profile$ = this.userService.profile$;

  public refreshProfile(): void {
    this.userService.refreshProfile();
  }
}