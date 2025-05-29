import { inject, Injectable } from "@angular/core";
import { IProfile } from "../interfaces";
import { BehaviorSubject, first, switchMap, throwError } from "rxjs";
import { UserService } from "../services/api/user.service";

@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private readonly userService: UserService = inject(UserService);

  public profile$ = this.userService.profile$;
}