import { WINDOW } from '@/app/shared/tokens/window.token';
import { inject, Injectable } from "@angular/core";

@Injectable()
export class WindowService {
    private isWin = inject(WINDOW);
    get windowRef(): any {
        return this.isWin ? window : {};
    }
}
