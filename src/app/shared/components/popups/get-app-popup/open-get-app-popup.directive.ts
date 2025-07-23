import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GetAppPopupComponent } from './get-app-popup.component';

@Directive({
    selector: '[openGetAppPopup]',
    standalone: true,
})
export class OpenGetAppPopupDirective {

    constructor( private dialog: MatDialog) {}

    @HostListener('click') 
    openPopup(): void {
        this.dialog.open(GetAppPopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        })
    }   
}