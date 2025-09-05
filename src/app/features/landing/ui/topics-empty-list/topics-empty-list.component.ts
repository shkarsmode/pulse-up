import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-topics-empty-list',
  standalone: true,
  imports: [PrimaryButtonComponent, RouterModule, AngularSvgIconModule],
  templateUrl: './topics-empty-list.component.html',
  styleUrl: './topics-empty-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsEmptyListComponent {
  @Input() searchString = '';
  @Input() message: string[] = [];

  public suggestTopicsLink = "/" + AppRoutes.User.Topic.SUGGEST;
}
