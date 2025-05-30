import { inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  public info(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      panelClass: ["snackbar-info"],
    });
  }
  public success(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      panelClass: ["snackbar-success"],
    });
  }
  public error(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
      panelClass: ["snackbar-error"],
    });
  }
}