import { Component } from '@angular/core';

@Component({
  selector: 'app-community',
  template: `
    
    <app-header />

    <div class="page">
        <router-outlet></router-outlet>
    </div>

    <app-footer />
      
  `,
  styles: `
    :host { display: flex; flex-direction: column; height: 100%; }
    .page { flex: 1 1 auto; }
  `
})
export class CommunityComponent {}
