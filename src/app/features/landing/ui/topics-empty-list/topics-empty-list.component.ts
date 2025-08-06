import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from "@/app/shared/modules/material.module";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-topics-empty-list',
  standalone: true,
  imports: [MaterialModule, PrimaryButtonComponent, RouterModule],
  templateUrl: './topics-empty-list.component.html',
  styleUrl: './topics-empty-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsEmptyListComponent {
  @Input() searchText = '';

  public suggestTopicsLink = "/" + AppRoutes.User.Topic.SUGGEST;
}
