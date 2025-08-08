

enum LandingRoutes {
    HOME = '',
    MAP = 'map',
    TOPICS = 'topics',
    TOPIC = 'topic/:id',
    HEATMAP = 'topic/:id/heatmap',
    USER = 'user/:username',
    ABOUT = 'about',
    LEADERBOARD = 'leaderboard',
}

enum CommunityRoutes {
    PRIVACY = 'privacy-policy',
    TERMS = 'terms-of-use',
    SUPPORT = 'support',
    NOT_FOUND = 'page-not-found',
    INVALID_LINK = 'invalid-link',
    CHILD_SAFETY = 'child-safety',
}


export enum TopicRoutes {
    HOW_IT_WORKS = 'user/topic/how-it-works',
    SUGGEST = 'user/topic/suggest',
    PREVIEW = 'user/topic/preview',
    SUBMITTED = 'user/topic/submitted', // as idea /:status if respond fails we can show smth like error component 
    PICK_LOCATION = 'user/topic/pick-location',
}

enum ProfileRoutes {
    OVERVIEW = 'profile/overview',
    EDIT = 'profile/edit',
    CHANGE_EMAIL = 'profile/change-email',
    VERIFY_EMAIL = 'profile/verify-email',
    CHANGE_PHONE_NUMBER = 'profile/change-phone-number',
    CONFIRM_PHONE_NUMBER = 'profile/confirm-phone-number',
    DELETE_ACCOUNT = 'profile/delete-account',
}

enum AuthRoutes {
    SIGN_IN = 'sign-in',
    CONFIRM_PHONE_NUMBER = 'confirm-phone-number',
}

export const AppRoutes = {
    'Auth': AuthRoutes,
    'Landing': LandingRoutes,
    'Community': CommunityRoutes,
    'User': {
        'Topic': TopicRoutes,
    },
    'Profile': ProfileRoutes,
}


