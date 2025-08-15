import { Campaign } from "@/app/shared/interfaces";

export const getCampaignGoalName = (campaign: Campaign): string => {
    if (!campaign.goals.length) return "";

    let goal = "";
    const currentGoal = campaign.goals[campaign.accomplishedGoals?.length || 0];

    if (currentGoal.supporters) {
        goal = `${currentGoal.supporters} supporter${currentGoal.supporters === 1 ? "" : "s"}`;
    } else if (currentGoal.lifetimeVotes) {
        goal = `${currentGoal.lifetimeVotes} lifetime vote${currentGoal.lifetimeVotes === 1 ? "" : "s"}`;
    } else if (currentGoal.dailyVotes) {
        goal = `${currentGoal.dailyVotes} daily vote${currentGoal.dailyVotes === 1 ? "" : "s"}`;
    }
    return goal;
};
