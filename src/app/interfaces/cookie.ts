//interface for cookie options
export interface ICookieOptions {
    // domain: string;
    httpOnly: boolean;
    sameSite: "strict" | "lax" | "none" | boolean;
    secure: boolean;
    maxAge?: number;
    expires?: Date;
}