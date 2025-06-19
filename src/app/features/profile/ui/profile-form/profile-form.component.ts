import { Component, DestroyRef, inject, Input } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { first, switchMap, take, tap } from "rxjs";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { atLeastOneLetterValidator } from "@/app/shared/helpers/validators/at-least-one-letter.validator";
import { usernameUniqueValidator } from "@/app/shared/helpers/validators/username-unique.validator";
import { UserService } from "@/app/shared/services/api/user.service";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { TextareaComponent } from "@/app/shared/components/ui-kit/textarea/textarea.component";
import { PicturePickerComponent } from "@/app/shared/components/ui-kit/picture-picker/picture-picker.component";
import { pictureValidator } from "@/app/shared/helpers/validators/picture.validator";
import { optionalLengthValidator } from "@/app/shared/helpers/validators/optional-length.validator";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { UserStore } from "@/app/shared/stores/user.store";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "@/app/features/user/ui/crop-image-popup/crop-image-popup.component";
import { CropResult } from "@/app/features/user/interfaces/crop-result.interface";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { ErrorMessageBuilder } from "../../helpers/error-message-builder";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-profile-form",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        InputComponent,
        TextareaComponent,
        PrimaryButtonComponent,
        PicturePickerComponent,
        SecondaryButtonComponent,
    ],
    templateUrl: "./profile-form.component.html",
    styleUrl: "./profile-form.component.scss",
})
export class ProfileFormComponent {
    @Input() public initialValues: {
        name: string;
        username: string;
        bio: string;
        picture: string | null;
    };

    private destroyed = inject(DestroyRef);
    private router = inject(Router);
    private dialog = inject(MatDialog);
    private fb: FormBuilder = inject(FormBuilder);
    private userStore: UserStore = inject(UserStore);
    private userService: UserService = inject(UserService);
    private settingsService: SettingsService = inject(SettingsService);
    private notificationService: NotificationService = inject(NotificationService);
    private authenticationService: AuthenticationService = inject(AuthenticationService);

    private isPicturePristine: boolean = true;
    private emailPlaceholder: string = "Add an email to secure your account";
    public form: FormGroup;
    public submitting: boolean = false;
    public phoneNumber: string | null = null;
    public email: string = this.emailPlaceholder;
    public profilePicture: File | null = null;
    public chngeEmailRoute = "/" + AppRoutes.Profile.CHANGE_EMAIL;
    public chngePhoneNumberRoute = "/" + AppRoutes.Profile.CHANGE_PHONE_NUMBER;
    public classes = {
        email: {},
    };

    constructor() {
        this.form = this.fb.group({
            name: "",
            username: "",
            bio: "",
            profilePicture: null,
        });
        this.phoneNumber = this.authenticationService.firebaseAuth.currentUser?.phoneNumber || null;
        this.email =
            this.authenticationService.firebaseAuth.currentUser?.email || this.emailPlaceholder;
        this.profilePicture = this.form.get("profilePicture")?.value || null;
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: [
                this.initialValues.name,
                [
                    Validators.required,
                    Validators.maxLength(50),
                    Validators.pattern(/^[A-Za-z\s']+$/),
                ],
            ],
            username: [
                this.initialValues.username,
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(50),
                    Validators.pattern(/^(?!.*__)(?:[A-Za-z0-9]*_?[A-Za-z0-9]*)$/),
                    atLeastOneLetterValidator(),
                ],
                [
                    usernameUniqueValidator(
                        this.userService.validateUsername,
                        this.initialValues.username,
                    ),
                ],
            ],
            bio: [this.initialValues.bio, [optionalLengthValidator(3, 150)]],
            profilePicture: [null, [pictureValidator()]],
        });
        this.form
            .get("profilePicture")
            ?.valueChanges.pipe(takeUntilDestroyed(this.destroyed))
            .subscribe(() => {
                this.isPicturePristine = false;
            });
        this.classes.email = {
            "profile-form__link": true,
            "profile-form__link--placeholder": this.email === this.emailPlaceholder,
        };
    }

    public get previewUrl(): string {
        if (this.initialValues.picture) {
            return `${this.settingsService.blobUrlPrefix}${this.initialValues.picture}`;
        }
        return "assets/svg/plus-placeholder.svg";
    }

    private disabled: boolean = false;

    public isDisabled(): boolean {
        let disabled = false;
        if (this.submitting) {
            disabled = true;
        } else if (this.isPristine()) {
            disabled = true;
        } else if (this.submitting || this.form.invalid) {
            disabled = true;
        } else if (this.form.status === "PENDING") {
            disabled = this.disabled;
        }
        this.disabled = disabled;
        return disabled;
    }

    public onBlur(name: string) {
        const control = this.form.get(name);
        if (control) {
            control.markAsTouched();
        }
    }

    public onSelectPicture(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
                CropImagePopupComponent,
                {
                    width: "100%",
                    maxWidth: "630px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                    data: {
                        event: event,
                        minWidth: 128,
                        minHeight: 128,
                        aspectRatio: 1,
                    },
                },
            );
            dialogRef.afterClosed().pipe(take(1)).subscribe(this.onCroppedImage);
        }
    }

    public onDeletePicture(): void {
        this.form.get("profilePicture")?.setValue(null);
    }

    public onSubmit(event: MouseEvent) {
        event.preventDefault();
        if (this.form.valid) {
            this.trimBioValue();
            this.submitting = true;
            this.userService
                .updateOwnProfile(this.form.value)
                .pipe(
                    take(1),
                    tap(() => this.userStore.refreshProfile()),
                )
                .subscribe({
                    next: () => {
                        this.submitting = false;
                        this.form.markAsPristine();
                        this.form.markAsUntouched();
                        this.isPicturePristine = true;
                        this.notificationService.success("Profile updated successfully.");
                        this.router.navigateByUrl("/" + AppRoutes.Profile.REVIEW);
                    },
                    error: () => {
                        this.submitting = false;
                        this.notificationService.error(
                            "Failed to update profile. Please try again.",
                        );
                    },
                });
        } else {
            this.form.markAllAsTouched();
        }
    }

    public onCancel(): void {
        this.router.navigateByUrl("/" + AppRoutes.Profile.REVIEW);
    }

    public getErrorMessage(name: string): string | null {
        const control = this.form.get(name);
        if (!control) return null;
        return ErrorMessageBuilder.getErrorMessage(control, name);
    }

    private trimBioValue() {
        const control = this.form.get("bio");
        if (typeof control?.value !== "string") return;

        const original = control.value;
        const trimmed = original
            .replace(/\n{2,}/g, "\n") // reduce multiple \n to one
            .replace(/[ \t]+/g, " ") // remove extra spaces and tabs
            .trim();

        this.form.patchValue({ bio: trimmed });
    }

    private isPristine(): boolean {
        return (
            (this.form.get("name")?.pristine &&
                this.form.get("username")?.pristine &&
                this.form.get("bio")?.pristine &&
                this.isPicturePristine) ||
            false
        );
    }

    private onCroppedImage = (result: CropResult) => {
        if (result.success) {
            this.form.get("profilePicture")?.patchValue(result.imageFile);
            this.isPicturePristine = false;
            this.profilePicture = result.imageFile;
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };
}
