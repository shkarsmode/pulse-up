

enum LandingRoutes {
    HOME = '',
    MAP = 'map',
    PULSES = 'pulses',
    PULSE = 'pulse/:id',
    HEATMAP = 'pulse/:id/heatmap',
}

enum CommunityRoutes {
    PRIVACY = 'privacy-policy',
    TERMS = 'terms-of-use',
    SUPPORT = 'support',
    NOT_FOUND = 'page-not-found',
    INVALID_LINK = 'invalid-link',
}


export enum TopicRoutes {
    HOW_IT_WORKS = 'user/topic/how-it-works',
    SUGGEST = 'user/topic/suggest',
    CONTACT_INFO = 'user/topic/contact-info',
    SUBMITTED = 'user/topic/submitted' // as idea /:status if respond fails we can show smth like error component 
}

enum ProfileRoutes {

}

export const AppRoutes = {
    'Landing': LandingRoutes,
    'Community': CommunityRoutes,
    'User': {
        'Topic': TopicRoutes,
        'Profile': ProfileRoutes,
    }
}


// export const UserRoutes = {
//     USER: 'user',
//     ProfileRoutes: {
//         PROFILE: 'user/profile',
//         PROFILE_STARTED: 'user/profile/started',
//         PROFILE_SUPPORTED: 'user/profile/supported',
//     },
//     NewTopicRoutes: {
//         NEW_TOPIC: 'user/-topic',
//         HOW_IT_WORKS: 'user/new-topic/how-it-works',
//         FORM: {
//             SUGGEST_TOPIC: 'user/new-topic/form/suggest-topic',
//             CONTACT_INFO: 'user/add-topic/form/contact-info',
//             SUBMIT_SUCSESS: 'user/new-topic/form/submit-success', 
//         }
//     },
// }


