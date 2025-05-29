import { Component } from '@angular/core';
import { ContainerComponent } from "../../../../shared/components/ui-kit/container/container.component";
import { ProfileFormComponent } from '../../ui/profile-form/profile-form.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ContainerComponent, ProfileFormComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {

}
