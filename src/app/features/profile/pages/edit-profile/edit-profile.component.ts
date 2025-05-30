import { Component, inject } from '@angular/core';
import { UserService } from '@/app/shared/services/api/user.service';
import { ProfileFormComponent } from '../../ui/profile-form/profile-form.component';
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ProfileFormComponent, ProfileLayoutComponent],
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
