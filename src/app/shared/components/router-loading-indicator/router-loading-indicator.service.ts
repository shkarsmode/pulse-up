import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class RouterLoadingIndicatorService {
    private loadingSubject = new BehaviorSubject<boolean>(true);
    public loading$ = this.loadingSubject.asObservable();

    public setLoading(isLoading: boolean): void {
        this.loadingSubject.next(isLoading);
    } 
}
