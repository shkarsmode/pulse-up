import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardShareButtonService {
  public pageUrl = signal(window.location.href).asReadonly();
}
