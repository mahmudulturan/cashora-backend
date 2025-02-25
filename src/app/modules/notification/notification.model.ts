import { INotification } from "./notification.interface";
import { Schema, model } from "mongoose";

const notificationSchema = new Schema<INotification>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['transaction', 'system', 'alert'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
