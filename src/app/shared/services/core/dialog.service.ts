import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";

@Injectable({
    providedIn: "root",
})
export class DialogService {
    constructor(private readonly dialog: MatDialog) {}

    open<TComponent, TConfig = any, TResult = any>(
        component: ComponentType<TComponent>,
        config?: MatDialogConfig<TConfig>,
    ): MatDialogRef<TComponent, TResult> {
        return this.dialog.open(component, {
            width: "500px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
            ...config,
        });
    }
}
