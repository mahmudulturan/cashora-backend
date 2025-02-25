import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

type StringValue = "7d" | "60d"

// generate jwt token
export const generateJwtToken = (
    payload: object,
    secret: string,
    expireTime: number | StringValue | undefined,
) => {
    const options: SignOptions = {
        expiresIn: expireTime
    };
    return jwt.sign(payload, secret, options);
};


// verify jwt token
export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret) as JwtPayload;
};

// generate otp code
export const otpGenerator = () => {
    const otpCode = Array.from({ length: 6 }, () => {
        const isLetter = Math.random() > 0.5;
        return isLetter
            ? String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97)) // A-Z or a-z
            : Math.floor(Math.random() * 10).toString();
    }).join('');
    return otpCode;
}