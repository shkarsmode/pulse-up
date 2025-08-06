import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MaterialModule } from "@/app/shared/modules/material.module";

@Component({
  selector: 'app-topics-empty-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './topics-empty-list.component.html',
  styleUrl: './topics-empty-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsEmptyListComponent {
  @Input() searchText = '';
}
