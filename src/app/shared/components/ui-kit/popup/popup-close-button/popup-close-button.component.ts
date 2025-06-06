import { Component, EventEmitter, Output } from '@angular/core';
import { CloseButtonComponent } from "../../buttons/close-button/close-button.component";

@Component({
  selector: 'app-popup-close-button',
  standalone: true,
  imports: [CloseButtonComponent],
  templateUrl: './popup-close-button.component.html',
  styleUrl: './popup-close-button.component.scss'
})
export class PopupCloseButtonComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
