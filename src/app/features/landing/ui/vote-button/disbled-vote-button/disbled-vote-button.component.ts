import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

@Component({
  selector: 'app-disbled-vote-button',
  standalone: true,
  imports: [PrimaryButtonComponent],
  templateUrl: './disbled-vote-button.component.html',
  styleUrl: './disbled-vote-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisbledVoteButtonComponent {

}
