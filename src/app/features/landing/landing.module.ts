import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";

import { environment } from "../../../environments/environment";
import { FadeInDirective } from "../../shared/animations/fade-in.directive";
import { HeartBeatDirective } from "../../shared/animations/heart-beat.directive";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { ComingSoonPopupDirective } from "../../shared/components/popups/comming-soon-popup/coming-soon-popup.directive";
import { OpenGetAppPopupDirective } from "../../shared/components/popups/get-app-popup/open-get-app-popup.directive";
import { LargePulseComponent } from "../../shared/components/pulses/large-pulse/large-pulse.component";
import { TopPulseCardComponent } from "../../shared/components/pulses/top-pulse/top-pulse-card.component";
import { SliderComponent } from "../../shared/components/slider/slider.component";
import { FlatButtonDirective } from "../../shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { GetAppButtonComponent } from "../../shared/components/ui-kit/buttons/get-app-button/get-app-button.component";
import { PrimaryButtonComponent } from "../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "../../shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { InputComponent } from "../../shared/components/ui-kit/input/input.component";
import { SelectComponent } from "../../shared/components/ui-kit/select/select.component";
import { SpinnerComponent } from "../../shared/components/ui-kit/spinner/spinner.component";
import { LoadImgPathDirective } from "../../shared/directives/load-img-path/load-img-path.directive";
import { FormatNumberPipe } from "../../shared/pipes/format-number.pipe";
import { AdBannerComponent } from "@/app/shared/components/banners/ad-banner/ad-banner.component";
import { MapComponent } from "./components/map/map.component";
import { MenuComponent } from "../../shared/components/ui-kit/menu/menu.component";
import { LandingComponent } from "./landing.component";
import { LandingRoutingModule } from "./landing.routing";
import { SocialsButtonComponent } from "../../shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { CopyButtonComponent } from "../../shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { AboutComponent } from "./pages/about/about.component";
import { NgxTooltip } from "@ngx-popovers/tooltip";
import { AddTopicPopupDirective } from "@/app/shared/components/popups/add-topic-popup/add-topic-popup.directive";
import { MarkerIconComponent } from "./components/map/components/marker-icon.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SwitchComponent } from "@/app/shared/components/ui-kit/switch/switch/switch.component";
import { UserComponent } from "./pages/user/user.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { IconButtonComponent } from "@/app/shared/components/ui-kit/buttons/icon-button/icon-button.component";
import { UserAvatarComponent } from './pages/user/components/user-avatar/user-avatar.component';
import { MainComponent } from "./pages/main/main.component";
import { PulsesComponent } from "./pages/pulses/pulses.component";
import { TopPulsesComponent } from "./pages/main/components/top-pulses/top-pulses.component";
import { InputSearchComponent } from "./pages/pulses/components/input-search/input-search.component";
import { PromoteAdsComponent } from "./pages/pulses/components/promote-ads/promote-ads.component";
import { PulsePageComponent } from "./pages/pulse-page/pulse-page.component";
import { MapPageComponent } from "./pages/map-page/map-page.component";
import { PulseHeatmapPageComponent } from "./pages/pulse-heatmap-page/pulse-heatmap-page.component";
import { AboutSectionComponent } from "./pages/main/components/about-section/about-section.component";
import { MainHeroComponent } from "./pages/main/components/main-hero/main-hero.component";
import { GlobeMapComponent } from "./pages/map-page/components/globe-map/globe-map.component";
import { MercatorMapComponent } from "./pages/map-page/components/mercator-map/mercator-map.component";

@NgModule({
    declarations: [
        LandingComponent,
        MainComponent,
        MapComponent,
        PulsesComponent,
        TopPulsesComponent,
        InputSearchComponent,
        PromoteAdsComponent,
        PulsePageComponent,
        MapPageComponent,
        PulseHeatmapPageComponent,
        AboutSectionComponent,
        AboutComponent,
        MainHeroComponent,
        MarkerIconComponent,
        GlobeMapComponent,
        MercatorMapComponent,
        UserComponent,
        UserAvatarComponent,
    ],
    imports: [
        CommonModule,
        LandingRoutingModule,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        InputComponent,
        SelectComponent,
        HeaderComponent,
        FooterComponent,
        SvgIconComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        LoadImgPathDirective,
        TopPulseCardComponent,
        LargePulseComponent,
        FormsModule,
        SpinnerComponent,
        FormatNumberPipe,
        SliderComponent,
        OpenGetAppPopupDirective,
        HeartBeatDirective,
        GetAppButtonComponent,
        ComingSoonPopupDirective,
        FlatButtonDirective,
        FadeInDirective,
        NgxTooltip,
        NgxMapboxGLModule.withConfig({
            accessToken: environment.mapboxToken,
        }),
        AdBannerComponent,
        AddTopicPopupDirective,
        MatCheckboxModule,
        SwitchComponent,
        ContainerComponent,
        IconButtonComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingModule {}
