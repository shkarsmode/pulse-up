import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dropdown-link',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dropdown-link.component.html',
  styleUrl: './dropdown-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownLinkComponent {
  @Input() link: string;
  @Input() accent?: boolean;

  @Output() handleclick = new EventEmitter<void>();

  public onClick(): void {
    this.handleclick.emit();
  }
}
