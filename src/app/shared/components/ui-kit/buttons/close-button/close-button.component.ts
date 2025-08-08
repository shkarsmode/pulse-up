import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-close-button',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
  ],
  template: `
    <button (click)="onClick()">
      <svg-icon src="assets/svg/close.svg" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    button {
      padding: 8px;
      cursor: pointer;
    }
  `,
})
export class CloseButtonComponent {
  @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

  public onClick() {
    this.handleClick.emit();
  }
}
