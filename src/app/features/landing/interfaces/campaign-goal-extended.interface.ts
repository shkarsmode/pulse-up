import { CampaignGoal } from "@/app/shared/interfaces";

export interface CampaignGoalExtended extends CampaignGoal {
    isAccomplished: boolean;
    isInProgress: boolean;
}