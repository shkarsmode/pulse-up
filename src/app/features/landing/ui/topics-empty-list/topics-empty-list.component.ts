import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-topics-empty-list',
  standalone: true,
  imports: [PrimaryButtonComponent, RouterModule, MatIcon],
  templateUrl: './topics-empty-list.component.html',
  styleUrl: './topics-empty-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsEmptyListComponent {
  @Input() searchText = '';

  public suggestTopicsLink = "/" + AppRoutes.User.Topic.SUGGEST;
}
