export interface ReportReasonNode {
    id: string;
    title: string;
    subtitle?: string;
    children?: ReportReasonNode[];
    requiresText?: boolean; // If true, user must type custom text on review step
    placeholder?: string;
}

export const REPORT_REASONS: ReportReasonNode[] = [
    {
        id: "inappropriate_or_offensive",
        title: "Inappropriate or Offensive",
        subtitle: "Hate speech, slurs, sexually explicit content, or discriminatory language.",
        children: [
            {
                id: "hate_speech_targeting_group",
                title: "Hate speech targeting a group",
            },
            {
                id: "sexual_or_explicit_content",
                title: "Sexual or explicit content",
            },
            {
                id: "profanity_or_slurs",
                title: "Profanity or slurs",
            },
            {
                id: "dehumanizing_or_degrading_remarks",
                title: "Dehumanizing or degrading remarks",
            },
        ],
    },
    {
        id: "promotes_violence_or_harm",
        title: "Promotes Violence or Harm",
        subtitle: "Encourages physical harm, threats, glorifies violence, or incites conflict.",
        children: [
            {
                id: "encourages_self_harm",
                title: "Encourages self-harm or suicide",
            },
            {
                id: "calls_for_violence",
                title: "Calls for violence against a group or individual",
            },
            {
                id: "glorifies_violent_acts",
                title: "Glorifies violent acts or terrorism",
            },
        ],
    },
    {
        id: "misleading_or_misinformation",
        title: "Misleading or Misinformation",
        subtitle: "Includes conspiracy theories, false claims, or impersonating factual information.",
        children: [
            {
                id: "health_or_medical_misinformation",
                title: "Health or medical misinformation",
            },
            {
                id: "political_conspiracy_theory",
                title: "Political conspiracy theory",
            },
            {
                id: "factually_incorrect_data",
                title: "Factually incorrect or misleading data",
            },
            {
                id: "false_impersonation_news_source",
                title: "False impersonation of a news source",
            },
        ],
    },
    {
        id: "spam_or_fake_engagement",
        title: "Spam or Fake Engagement",
        subtitle: "Repetitive content, irrelevant links, bot-like behavior, or artificial boosting.",
        children: [
            {
                id: "bot_like_activity",
                title: "Bot-like activity or automation",
            },
            {
                id: "duplicate_or_low_effort_posts",
                title: "Duplicate or low-effort posts",
            },
            {
                id: "promotional_spam",
                title: "Promotional spam or link stuffing",
            },
        ],
    },
    {
        id: "impersonation_or_misleading_identity",
        title: "Impersonation or Misleading Identity",
        subtitle: "Pretending to be someone else or using misleading names or branding.",
        children: [
            {
                id: "uses_someone_elses_name_image",
                title: "Uses someone else's name or image",
            },
            {
                id: "parody_without_disclosure",
                title: "Parody account without disclosure",
            },
            {
                id: "misleading_profile_affiliation",
                title: "Misleading profile or organization affiliation",
            },
        ],
    },
    {
        id: "trademark_or_copyright_violation",
        title: "Trademark or Copyright Violation",
        subtitle: "Unauthorized use of logos, images, music, or trademarked names.",
        children: [
            {
                id: "brand_logos_without_permission",
                title: "Using brand logos without permission",
            },
            {
                id: "copying_artwork_from_creator",
                title: "Copying artwork or media from another creator",
            },
            {
                id: "posting_copyrighted_content",
                title: "Posting copyrighted content without authorization",
            },
        ],
    },
    {
        id: "other",
        title: "Other",
        subtitle: "Doesn’t fit the above categories but violates Pulse Up community standards.",
        children: [
            {
                id: "harassment_or_bullying",
                title: "Harassment or bullying",
            },
            {
                id: "privacy_violation",
                title: "Privacy violation (e.g. sharing personal info)",
            },
            {
                id: "off_topic",
                title: "Off-topic or irrelevant to Pulse Up's purpose",
            },
            {
                id: "custom_other_reason",
                title: "Other reason (brings up a way to type your own reason)",
                requiresText: true,
                placeholder: "Describe your reason",
            },
        ],
    },
];
