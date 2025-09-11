export type TopicQrcodePopupType = "topic" | "profile" | "leaderboard";

export interface TopicQRCodePopupData {
    link: string;
    type: TopicQrcodePopupType;
}
