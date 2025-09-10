import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardShareButtonService {
  public get shareUrl() {
    return window.location.href;
  }
}
