import { TopicVotingHistory } from "@/app/shared/interfaces";

const normalizeVoteDateString = (dateString: string) => {
    // Ensure the date string is in ISO 8601 format with 'Z' suffix for UTC
    if (!dateString.endsWith("Z")) {
        return `${dateString}Z`;
    }
    return dateString;
};

export const normalizeTopicStatsResponse = (response: TopicVotingHistory) => {
    const normalizedResponse: Record<string, number> = {};
    Object.entries(response).forEach(([date, votes]) => {
        normalizedResponse[normalizeVoteDateString(date)] = votes;
    });
    return normalizedResponse;
};
