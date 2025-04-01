import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyComponent } from './privacy/privacy.component';
import { InvalidLinkComponent } from './invalid-link/invalid-link.component';
import { SupportComponent } from './support/support.component';
import { TermsComponent } from './terms/terms.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ChildSafetyComponent } from './child-safety/child-safety.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { PrimaryButtonComponent } from '../../shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdBannerComponent } from '../../shared/components/banners/ad-banner/ad-banner.component';
import { CommunityComponent } from './community.component';
import { CommunityRoutingModule } from './community.routing';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@NgModule({
  declarations: [
    PrivacyComponent,
    InvalidLinkComponent,
    SupportComponent,
    TermsComponent,
    NotFoundComponent,
    CommunityComponent,
    ChildSafetyComponent,
  ],
  imports: [
    CommonModule,
    CommunityRoutingModule,
    SvgIconComponent,
    PrimaryButtonComponent,
    RouterLink,
    RouterLinkActive,
    AdBannerComponent,
    HeaderComponent,
    FooterComponent,
  ]
})
export class CommunityModule { }
