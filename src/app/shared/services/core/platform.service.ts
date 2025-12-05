import { Injectable } from '@angular/core';
import { PlatformEnum } from '../../enums/user-agent.enum';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    
    private userAgent: string = typeof window === 'undefined' ? '' : navigator.userAgent;
    
    public getPlatform(): PlatformEnum {
        if (/Android/i.test(this.userAgent)) return PlatformEnum.Android;
        else if (/iPhone|iPad|iPod/i.test(this.userAgent)) return PlatformEnum.iOS
        else return PlatformEnum.Desktop;
    }

    public get value(): PlatformEnum {
        return this.getPlatform();
    }


    
}