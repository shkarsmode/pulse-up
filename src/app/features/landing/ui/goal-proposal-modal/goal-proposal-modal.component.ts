import { PopupCloseButtonComponent } from '@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component';
import { PopupLayoutComponent } from '@/app/shared/components/ui-kit/popup/popup.component';
import { DialogService } from '@/app/shared/services/core/dialog.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProposalSuccessModalComponent } from '../proposal-success-modal/proposal-success-modal.component';

type GoalType = 'supporters' | 'totalPulses' | 'dailyActivity';
type PledgeType = 'donation' | 'action';
type ChampionType = 'individual' | 'organization' | 'anonymous';

interface GoalProposalData {
    goalType: GoalType;
    target: number;
    startDate?: string;
    endDate?: string;
    targetDate?: string;
    pledgeType: PledgeType;
    donationAmount?: number;
    pledgeDescription: string;
    championType: ChampionType;
    name?: string;
    organizationName?: string;
    website?: string;
    logoUrl?: string;
    email: string;
}

@Component({
    selector: 'app-goal-proposal-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
    ],
    templateUrl: './goal-proposal-modal.component.html',
    styleUrl: './goal-proposal-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalProposalModalComponent {
    public readonly dialogRef = inject(MatDialogRef<GoalProposalModalComponent>);
    private readonly fb = inject(FormBuilder);
    private readonly dialogService = inject(DialogService);

    public currentStep = 1;
    public goalForm: FormGroup;
    public aboutForm: FormGroup;

    constructor() {
        this.goalForm = this.fb.group({
            goalType: ['supporters', Validators.required],
            target: [500, [Validators.required, Validators.min(1)]],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            targetDate: [''],
            pledgeType: ['action', Validators.required],
            donationAmount: [100],
            pledgeDescription: ['', Validators.required],
        });

        this.aboutForm = this.fb.group({
            championType: ['individual', Validators.required],
            name: [''],
            organizationName: [''],
            website: [''],
            logoUrl: [''],
            email: ['', [Validators.required, Validators.email]],
        });

        // Subscribe to goal type changes
        this.goalForm.get('goalType')?.valueChanges.subscribe((type: GoalType) => {
            this.onGoalTypeChange(type);
        });

        // Subscribe to pledge type changes
        this.goalForm.get('pledgeType')?.valueChanges.subscribe((type: PledgeType) => {
            this.onPledgeTypeChange(type);
        });

        // Subscribe to champion type changes
        this.aboutForm.get('championType')?.valueChanges.subscribe((type: ChampionType) => {
            this.onChampionTypeChange(type);
        });

        // Initialize with default values
        this.onGoalTypeChange('supporters');
        this.onChampionTypeChange('individual');
    }

    public get minTarget(): number {
        const goalType = this.goalForm.get('goalType')?.value;
        switch (goalType) {
            case 'supporters':
                return 500;
            case 'totalPulses':
            case 'dailyActivity':
                return 10;
            default:
                return 1;
        }
    }

    public get currentStats(): number {
        // This would come from actual topic stats in real implementation
        const goalType = this.goalForm.get('goalType')?.value;
        switch (goalType) {
            case 'supporters':
                return 444;
            case 'totalPulses':
            case 'dailyActivity':
                return 1;
            default:
                return 0;
        }
    }

    public selectGoalType(type: GoalType): void {
        this.goalForm.patchValue({ goalType: type });
    }

    public selectPledgeType(type: PledgeType): void {
        this.goalForm.patchValue({ pledgeType: type });
    }

    public selectChampionType(type: ChampionType): void {
        this.aboutForm.patchValue({ championType: type });
    }

    public onGoalTypeChange(type: GoalType): void {
        const targetControl = this.goalForm.get('target');
        const startDateControl = this.goalForm.get('startDate');
        const endDateControl = this.goalForm.get('endDate');
        const targetDateControl = this.goalForm.get('targetDate');

        if (type === 'dailyActivity') {
            targetControl?.setValue(10);
            targetControl?.setValidators([Validators.required, Validators.min(10)]);
            startDateControl?.clearValidators();
            endDateControl?.clearValidators();
            targetDateControl?.setValidators([Validators.required]);
        } else {
            if (type === 'supporters') {
                targetControl?.setValue(500);
                targetControl?.setValidators([Validators.required, Validators.min(500)]);
            } else {
                targetControl?.setValue(10);
                targetControl?.setValidators([Validators.required, Validators.min(10)]);
            }
            startDateControl?.setValidators([Validators.required]);
            endDateControl?.setValidators([Validators.required]);
            targetDateControl?.clearValidators();
        }

        targetControl?.updateValueAndValidity();
        startDateControl?.updateValueAndValidity();
        endDateControl?.updateValueAndValidity();
        targetDateControl?.updateValueAndValidity();
    }

    public onPledgeTypeChange(type: PledgeType): void {
        const donationControl = this.goalForm.get('donationAmount');
        
        if (type === 'donation') {
            donationControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
            donationControl?.clearValidators();
        }
        
        donationControl?.updateValueAndValidity();
    }

    public onChampionTypeChange(type: ChampionType): void {
        const nameControl = this.aboutForm.get('name');
        const orgNameControl = this.aboutForm.get('organizationName');
        const websiteControl = this.aboutForm.get('website');
        const logoControl = this.aboutForm.get('logoUrl');

        // Clear all validators first
        nameControl?.clearValidators();
        orgNameControl?.clearValidators();
        websiteControl?.clearValidators();
        logoControl?.clearValidators();

        if (type === 'individual') {
            nameControl?.setValidators([Validators.required]);
        } else if (type === 'organization') {
            orgNameControl?.setValidators([Validators.required]);
        }

        nameControl?.updateValueAndValidity();
        orgNameControl?.updateValueAndValidity();
        websiteControl?.updateValueAndValidity();
        logoControl?.updateValueAndValidity();
    }

    public goToNextStep(): void {
        if (this.goalForm.valid) {
            this.currentStep = 2;
        }
    }

    public goBack(): void {
        this.currentStep = 1;
    }

    public submitProposal(): void {
        if (this.goalForm.valid && this.aboutForm.valid) {
            const proposalData: GoalProposalData = {
                ...this.goalForm.value,
                ...this.aboutForm.value,
            };
            console.log('Proposal submitted:', proposalData);
            
            // Закрываем текущую модалку и открываем success модалку
            this.dialogRef.close(proposalData);
            this.dialogService.open(ProposalSuccessModalComponent, {
                disableClose: false,
                panelClass: 'success-modal-dialog'
            });
        }
    }

    public get goalTypeValue(): GoalType {
        return this.goalForm.get('goalType')?.value;
    }

    public get pledgeTypeValue(): PledgeType {
        return this.goalForm.get('pledgeType')?.value;
    }

    public get championTypeValue(): ChampionType {
        return this.aboutForm.get('championType')?.value;
    }
}
