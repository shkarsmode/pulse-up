import { Component } from '@angular/core';

@Component({
    selector: 'app-topic',
    template: ` <router-outlet></router-outlet> `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: fit-content;
            width: 100%;
            max-width: 1030px;
            border-radius: 20px;
            margin: 0 auto;
            background: linear-gradient(267.31deg, rgba(119, 0, 238, 0.04) 1.01%, rgba(119, 0, 238, 0.04) 99.02%);
            padding: 0 24px;
        }

        @media screen and (max-width: 500px) {
            ::ng-deep .user-page {
                padding: 0 !important;
            }

            :host {
                border-radius: 0px;
                margin-top: -1px;
                height: 100%;
                padding: 0 20px;
            }

        }  
    `,
})
export class TopicComponent {}
