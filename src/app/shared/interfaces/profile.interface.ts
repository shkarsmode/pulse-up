export interface IProfile {
    id: string;
    name: string;
    username: string;
    bio?: string;
    picture?: string;
    createdAt: string;
    lastVotedAt: string;
    totalVotes: number;
    demographicProfile?: any;
    totalTopics: number;
    activeTopics: number;
    activeTopicsLimit: number;
  }
  