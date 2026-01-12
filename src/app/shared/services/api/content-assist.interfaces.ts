
export interface PolishTopicRequest {
    title: string;
    description: string;
}

export interface PolishTopicResponse {
    title: string;
    description: string;
    tags: string[];
    language: string;
    moderated: boolean;
    moderationNotes: string;
}

export interface GenerateTopicPicturesRequest {
    title: string;
    description: string;
    inferCoverImage?: boolean; // Default true
    inferPhotoIcon?: boolean; // Default true
    inferSymbolicIcon?: boolean; // Default true
}

export interface GeneratePicturesResponse {
    imageUrl: string; // Base64
    photoIconUrl: string; // Base64
    symbolicIconUrl: string; // Base64
    mainSubject: string;
}
