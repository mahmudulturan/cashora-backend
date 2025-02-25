import { Document, Types } from "mongoose";

export interface IOTP extends Document {
    userId: Types.ObjectId;
    email: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
}
