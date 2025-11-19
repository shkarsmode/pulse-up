import { IVote } from "../interfaces/vote.interface";

export class VoteUtils {
    public static isActiveVote(vote: IVote | null, activeVoteInterval: number) {
        if (!vote || !vote.updatedAt) return false;

        const updatedAt = new Date(vote.updatedAt).getTime();
        const now = Date.now();
        const diffInMs = now - updatedAt;

        const activeVoteIntervalMs = activeVoteInterval * 60 * 1000;
        return diffInMs < activeVoteIntervalMs;
    }

    public static parseVoteInfo(vote: IVote) {
        return vote.location;
    }

    public static parseVoteLocation(location: string) {
        const locationArray = location.split(",");

        if (locationArray.length > 2) {
            return `${locationArray[0]},${locationArray[locationArray.length - 1]}`;
        }
        return location;
    }

    public static parseVoteDate(date: string) {
        const d = new Date(date);

        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();

        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";

        hours = hours % 12 || 12;

        return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
    }

    public static calculateTimeLeft(vote: IVote, interval: number) {
        const now = new Date();
        const updatedAt = new Date(vote.updatedAt);

        // Time passed in ms
        const timePassedMs = now.getTime() - updatedAt.getTime();

        // Minimum interval in ms
        const minVoteIntervalMs = interval * 60 * 1000;

        // Time left
        const timeLeftMs = Math.max(minVoteIntervalMs - timePassedMs, 0);

        return timeLeftMs;
    }

    public static isVoteExpired(vote: IVote, interval: number) {
        const timeLeft = this.calculateTimeLeft(vote, interval);
        return timeLeft <= 0;
    }

    public static formatDuration(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
            seconds,
        ).padStart(2, "0")}`;
    }
}
