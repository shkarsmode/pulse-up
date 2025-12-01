import { inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { WINDOW } from '../../tokens/window.token';

@Injectable({
    providedIn: 'root',
})
export class HeaderGuard implements CanActivate {
    private isWin = inject(WINDOW);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.isWin) return true;
        
        if (state.url === '/') {
            document.body.classList.add('header-contrast');
        }

        return true;
    }
}
