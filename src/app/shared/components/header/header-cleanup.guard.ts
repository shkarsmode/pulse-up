import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HeaderCleanupGuard implements CanDeactivate<unknown> {
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        document.body.classList.remove('header-contrast');
        return true;
    }
}
