import { Component, Directive, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommingSoonPopupComponent } from './comming-soon-popup.component';
import { EmailPopupComponent } from './email-popup/email-popup.component';

@Directive({
    selector: '[openComingSoonPopup]',
    standalone: true,
})
export class ComingSoonPopupDirective {
    @Input() isAddPulsePopup = false;

    constructor( private dialog: MatDialog) {}

    @HostListener('click') 
    openPopup(): void {

        
        this.dialog.open(this.popup, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        })
    }
    
    get popup(): any {
        return this.isAddPulsePopup ? EmailPopupComponent : CommingSoonPopupComponent;
    } 
 }