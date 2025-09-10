import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardShareButtonService {
  public getShareUrl() {
    console.log('Getting share URL:', window.location.href);
    
    return window.location.href;
  }
}
