import { Component, inject } from '@angular/core';
import { ContainerComponent } from "../../../../shared/components/ui-kit/container/container.component";
import { ProfileFormComponent } from '../../ui/profile-form/profile-form.component';
import { LoadingIndicatorComponent } from "../../../../shared/components/loading-indicator/loading-indicator.component";
import { LoadingPageComponent } from "../../../../shared/components/loading/loading-page.component";
import { LogoComponent } from '@/app/shared/components/loading/logo/logo.component';
import { UserService } from '@/app/shared/services/api/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ContainerComponent, ProfileFormComponent, LogoComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  private readonly userService: UserService = inject(UserService);
  public isLoading: boolean = true;

  public profileFormvalues = {
    name: '',
    username: '',
    bio: '',
    picture: null as string | null,
  }

  ngOnInit() {
    this.userService.profile$.subscribe((profile) => {
      if (profile) {
        this.profileFormvalues.name = profile.name || '';
        this.profileFormvalues.username = profile.username || '';
        this.profileFormvalues.bio = profile.bio || '';
        this.profileFormvalues.picture = profile.picture || null;
      }
      this.isLoading = false;
    })
  }
}
