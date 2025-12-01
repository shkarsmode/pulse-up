import { WINDOW } from '@/app/shared/tokens/window.token';
import { Component, inject, } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  standalone: true,
  imports: [
    SvgIconComponent,
  ]
})
export class LogoComponent {

  private isWin = inject(WINDOW);
  public window = this.isWin ? window : { innerWidth: 0 };

}
