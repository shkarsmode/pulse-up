import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from '@/app/shared/components/ui-kit/container/container.component';
import { LogoComponent } from '@/app/shared/components/router-loading-indicator/logo/logo.component';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, LogoComponent, ContainerComponent],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.scss'
})
export class ProfileLayoutComponent {
  @Input() public isLoading = false;
}
