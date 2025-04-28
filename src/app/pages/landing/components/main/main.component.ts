import { Component, inject } from '@angular/core';
import { MetaService } from '@/app/shared/services/core/meta.service';
import { ActivatedRoute } from '@angular/router';



@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss',
})
export class MainComponent {
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private metaService: MetaService = inject(MetaService);

    ngOnInit() {
        this.metaService.updateMetaTags(this.activatedRoute);
    }
}
