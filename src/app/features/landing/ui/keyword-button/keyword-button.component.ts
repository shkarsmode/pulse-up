import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ITopicKeyword } from "../../interfaces/topic-keyword.interface";

@Component({
    selector: "app-keyword-button",
    standalone: true,
    imports: [],
    templateUrl: "./keyword-button.component.html",
    styleUrl: "./keyword-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeywordButtonComponent {
    @Input() keyword: ITopicKeyword;

    private router = inject(Router);

    public onClick(): void {
        const params: Record<string, string> = {};
        switch (this.keyword.type) {
            case "static": {
                console.log(this.keyword.label);
                
                params["category"] = this.keyword.label;
                params["search"] = "";
                break;
            }
            case "dynamic": {
                params["search"] = this.keyword.label;
                params["category"] = "newest";
                break;
            }
        }
        this.router.navigate(["/topics"], { queryParams: params });
    }
}
