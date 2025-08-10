import { Component } from '@angular/core';
import { AdBannerComponent } from "@/app/shared/components/banners/ad-banner/ad-banner.component";

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
  standalone: true,
  imports: [AdBannerComponent]
})
export class SupportComponent {}
