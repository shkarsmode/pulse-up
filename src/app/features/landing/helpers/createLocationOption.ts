import { ILeaderboardLocationOption } from "../interfaces/leaderboard-filter.interface";

export const createLocationOption = ({
    location,
    label,
}: {
    location: {
        country: string;
        region?: string | null;
        city?: string | null;
    };
    label: string;
}): ILeaderboardLocationOption => {
    const { country, region, city } = location;
    const optionId = Object.values(location).filter(Boolean).join("-");
    return {
        id: optionId,
        label,
        data: {
            country: country,
            region: region || null,
            city: city || null,
        },
    };
};
