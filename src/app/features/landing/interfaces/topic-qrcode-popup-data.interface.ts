export type TopicQrcodePopupType = "topic" | "profile" | "leaderboard";

export interface TopicQRCodePopupData {
    link: string;
    popup: {
        title: string;
        subtitle: string;
    };
    banner: {
        icon: string;
        title: string;
        subtitle: string;
    } | false;
}
