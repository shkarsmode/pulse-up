import { inject, Injectable } from "@angular/core";
import { IAuthStrategy } from "../interface/auth-strategy.interface";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class SignInService implements IAuthStrategy {
    private authenticationService = inject(AuthenticationService);
    async authenticate(email: string, password: string): Promise<void> {
        await this.authenticationService.signInWithEmailAndPassword(email, password);
    }
}
