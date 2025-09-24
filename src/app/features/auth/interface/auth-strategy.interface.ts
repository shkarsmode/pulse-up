export interface IAuthStrategy {
    authenticate(email: string, password: string): Promise<void>;
};
