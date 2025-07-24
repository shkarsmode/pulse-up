import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '@/app/shared/components/loading/logo/logo.component';
import { ContainerComponent } from '@/app/shared/components/ui-kit/container/container.component';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, LogoComponent, ContainerComponent],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.scss'
})
export class ProfileLayoutComponent {
  @Input() public isLoading: boolean = false;
}
