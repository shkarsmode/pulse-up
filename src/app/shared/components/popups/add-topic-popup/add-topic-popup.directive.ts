import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTopicPopupComponent } from './add-topic-popup.component';

@Directive({
    selector: '[openAddTopicPopup]',
    standalone: true,
})
export class AddTopicPopupDirective {

    constructor( private dialog: MatDialog) {}

    @HostListener('click') 
    openPopup(): void {
        this.dialog.open(AddTopicPopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        })
    }   
}