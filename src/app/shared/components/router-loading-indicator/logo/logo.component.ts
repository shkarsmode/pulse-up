import { Component, } from '@angular/core';
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

  public window = window;

}
