import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { map, take   } from "rxjs";
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
import { ProfileService } from "@/app/shared/services/profile/profile.service";

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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent implements OnInit {
    public initialValues = input.required<{
        name: string;
        username: string;
        bio: string;
        picture: string | null;
    }>();

    private destroyed = inject(DestroyRef);
    private router = inject(Router);
    private dialog = inject(MatDialog);
    private fb: FormBuilder = inject(FormBuilder);
    private profileService: ProfileService = inject(ProfileService);
    private userService: UserService = inject(UserService);
    private settingsService: SettingsService = inject(SettingsService);
    private notificationService: NotificationService = inject(NotificationService);
    private authenticationService: AuthenticationService = inject(AuthenticationService);

    private isPicturePristine = signal(true);
    private emailPlaceholder = signal("Add an email to secure your account");
    public form: FormGroup;
    public submitting = signal(false);
    public phoneNumber = signal<string | null>(null);
    public email = signal(this.emailPlaceholder());
    public profilePicture = signal<File | null>(null);
    public chngeEmailRoute = "/" + AppRoutes.Profile.CHANGE_EMAIL;
    public chngePhoneNumberRoute = "/" + AppRoutes.Profile.CHANGE_PHONE_NUMBER;
    public classes = {
        email: {},
    };

    constructor() {
        this.authenticationService.firebaseUser$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe((user) => {
                if (user && user.email) {
                    this.email.set(user.email);
                }
                if (user && user.phoneNumber) {
                    this.phoneNumber.set(user.phoneNumber);
                }
            });
    }

    ngOnInit() {
        const values = this.initialValues();
        this.form = this.fb.group({
            name: [
                values.name,
                [
                    Validators.required,
                    Validators.maxLength(50),
                    Validators.pattern(/^[A-Za-z\s']+$/),
                ],
            ],
            username: [
                values.username,
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(50),
                    Validators.pattern(/^(?!.*__)(?:[A-Za-z0-9]*_?[A-Za-z0-9]*)$/),
                    atLeastOneLetterValidator(),
                ],
                [usernameUniqueValidator(this.userService.validateUsername, values.username)],
            ],
            bio: [values.bio, [optionalLengthValidator(3, 150)]],
            profilePicture: [null, [pictureValidator()]],
        });
        this.form
            .get("profilePicture")
            ?.valueChanges.pipe(takeUntilDestroyed(this.destroyed))
            .subscribe(() => {
                this.isPicturePristine.set(false);
            });
        this.profilePicture.set(this.form.get("profilePicture")?.value || null);
        this.classes.email = {
            "profile-form__link": true,
            "profile-form__link--placeholder": this.email() === this.emailPlaceholder(),
        };
    }

    public previewUrl$ = this.settingsService.settings$.pipe(
        map((settings) => {
            const picture = this.initialValues().picture;
            if (picture) {
                return `${settings.blobUrlPrefix}${picture}`;
            }
            return "assets/svg/plus-placeholder.svg";
        }),
    );

    private disabled = false;

    public isDisabled(): boolean {
        let disabled = false;
        if (this.submitting()) {
            disabled = true;
        } else if (this.isPristine()) {
            disabled = true;
        } else if (this.submitting() || this.form.invalid) {
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
            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe((result) => this.onCroppedImage(result));
        }
    }

    public onDeletePicture(): void {
        this.form.get("profilePicture")?.setValue(null);
    }

    public async onSubmit(event: MouseEvent) {
        event.preventDefault();
        if (this.form.valid) {
            this.trimBioValue();
            this.submitting.set(true);

            try {
                await this.profileService.updateProfile(this.form.value);
                this.submitting.set(false);
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.isPicturePristine.set(true);
                this.notificationService.success("Profile updated successfully.");
                this.router.navigateByUrl("/" + AppRoutes.Profile.OVERVIEW);
            } catch (error: unknown) {
                console.log("Error updating profile:", error);
                this.submitting.set(false);
                this.notificationService.error("Failed to update profile. Please try again.");
            }
        } else {
            this.form.markAllAsTouched();
        }
    }

    public onCancel(): void {
        this.router.navigateByUrl("/" + AppRoutes.Profile.OVERVIEW);
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
                this.isPicturePristine()) ||
            false
        );
    }

    private onCroppedImage = (result: CropResult) => {
        if (result.success) {
            this.form.get("profilePicture")?.patchValue(result.imageFile);
            this.isPicturePristine.set(false);
            this.profilePicture.set(result.imageFile);
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };
}
