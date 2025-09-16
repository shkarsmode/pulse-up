import { ILeaderboardLocationOption } from "../interfaces/leaderboard-filter.interface";
import { createLocationName } from "./createLocationName";

export const createLocationOption = ({
    location,
}: {
    location: {
        country: string;
        region?: string | null;
        city?: string | null;
    };
}): ILeaderboardLocationOption => {
    const { country, region, city } = location;
    const optionId = Object.values(location).filter(Boolean).join("-");
    return {
        id: optionId,
        label: createLocationName({ country, region, city }),
        data: {
            country: country,
            region: region || null,
            city: city || null,
        },
    };
};
