import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
    GeneratePicturesResponse,
    GenerateTopicPicturesRequest,
    PolishTopicRequest,
    PolishTopicResponse,
} from "./content-assist.interfaces";

@Injectable({
    providedIn: "root",
})
export class ContentAssistService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/content-assist`;

    public polishTopic(request: PolishTopicRequest): Observable<PolishTopicResponse> {
        return this.http.post<PolishTopicResponse>(`${this.apiUrl}/polish-topic`, request);
    }

    public generatePictures(
        request: GenerateTopicPicturesRequest,
    ): Observable<GeneratePicturesResponse> {
        return this.http.post<GeneratePicturesResponse>(
            `${this.apiUrl}/generate-pictures`,
            request,
        );
    }

    public moderateTopic(request: PolishTopicRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/moderate-topic`, request);
    }
}
