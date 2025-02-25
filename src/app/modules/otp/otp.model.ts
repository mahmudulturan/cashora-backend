import mongoose, { Schema } from 'mongoose';
import { IOTP } from './otp.interface';

const otpSchema = new Schema<IOTP>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: function () {
            return new Date(Date.now() + 10 * 60 * 1000);
        }
    }
}, { timestamps: true });

// index for faster queries
otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP; 