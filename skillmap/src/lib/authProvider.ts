

class AuthClient extends pxt.auth.AuthClient {
    protected onSignedIn(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected onSignedOut(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected onSignInFailed(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected onProfileDeleted(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    protected onApiError(err: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export function client() {
    return pxt.auth.client() ?? new AuthClient();
}
