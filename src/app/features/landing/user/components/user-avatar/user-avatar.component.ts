import { Component, inject, Input } from '@angular/core';
import { SettingsService } from '@/app/shared/services/api/settings.service';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {
  @Input() public url?: string = "";
  @Input() public name: string = "";

  private readonly settingsService: SettingsService = inject(SettingsService);

  public get pictureUrl(): string | null {
    return this.url ? this.settingsService.blobUrlPrefix + this.url : null;
  }
}
