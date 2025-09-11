import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardShareButtonService {
  public getShareUrl() {
    return window.location.href;
  }
}
