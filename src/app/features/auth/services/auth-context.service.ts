import { Injectable } from "@angular/core";
import { IAuthStrategy } from "../interface/auth-strategy.interface";

@Injectable({
    providedIn: "root",
})
export class AuthContextService implements IAuthStrategy {
    private strategy!: IAuthStrategy;
    public setStrategy(strategy: IAuthStrategy): void {
        this.strategy = strategy;
    }
    authenticate(email: string, password: string): Promise<void> {
        return this.strategy.authenticate(email, password);
    }
}
