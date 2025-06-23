import { IVote } from "../interfaces/vote.interface";

export class VoteUtils {
    public static isActiveVote(vote: IVote) {
        if (!vote.updatedAt) return false;

        const updatedAt = new Date(vote.updatedAt).getTime();
        const now = Date.now();
        const diffInMs = now - updatedAt;

        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        return diffInMs < twentyFourHoursInMs;
    }

    public static parseVoteInfo(vote: IVote) {
        return `${this.parseVoteLocation(vote.location)}\n${this.parseVoteDate(vote.updatedAt)}`;
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
}
