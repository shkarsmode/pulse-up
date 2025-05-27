import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { CollectUserInfoService } from "../../services/user/collect-user-info.service";

@Injectable({
  providedIn: 'root',
})
export class CollectPersonalInfoGuard implements CanActivateChild {
  private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
  private readonly collectUserInfoService: CollectUserInfoService = inject(CollectUserInfoService);

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const userToken = this.authenticationService.userTokenValue;
    if (userToken) {
      this.collectUserInfoService.collectPersonalInfo();
    }

    return true;
  }
}