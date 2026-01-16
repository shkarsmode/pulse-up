import { Campaign } from "@/app/shared/interfaces";

export const getCampaignGoalName = (campaign: Campaign): string => {
    if (!campaign.goals.length) return "";

    let goal = "";
    const goalIndex = campaign.accomplishedGoals?.length || 0;
    // For completed state, show the last goal
    const currentGoalIndex = goalIndex >= campaign.goals.length ? campaign.goals.length - 1 : goalIndex;
    const currentGoal = campaign.goals[currentGoalIndex];

    if (currentGoal.supporters) {
        goal = `${currentGoal.supporters} supporter${currentGoal.supporters === 1 ? "" : "s"}`;
    } else if (currentGoal.lifetimeVotes) {
        goal = `${currentGoal.lifetimeVotes} lifetime vote${currentGoal.lifetimeVotes === 1 ? "" : "s"}`;
    } else if (currentGoal.dailyVotes) {
        goal = `${currentGoal.dailyVotes} daily vote${currentGoal.dailyVotes === 1 ? "" : "s"}`;
    }
    return goal;
};
