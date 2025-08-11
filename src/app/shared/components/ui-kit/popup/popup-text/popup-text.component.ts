import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-popup-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-text.component.html',
  styleUrl: './popup-text.component.scss'
})
export class PopupTextComponent {
  @Input() textAlign: 'left' | 'center' | 'right' = 'left';
}
