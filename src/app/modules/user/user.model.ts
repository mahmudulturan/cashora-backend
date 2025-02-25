import { model, Schema } from "mongoose";
import { IName, IUser } from "./user.interface";
import bcrypt from 'bcrypt'
import envConfig from "../../configs/env.config";

const nameSchema = new Schema<IName>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
}, {
    _id: false,
    virtuals: true
})


const userSchema = new Schema<IUser>({
    name: {
        type: nameSchema,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 11,
        unique: true
    },
    pin: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5,
        select: false
    },
    nid: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
    },
    balance: {
        type: Number,
        default: function () {
            return this.role === 'agent' ? 100000 : 40;
        }
    },
    income: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'pending'],
        default: function () {
            return this.role === 'agent' ? 'pending' : 'active';
        }
    },
    activeSession: {
        token: {
            type: String,
            default: null
        },
        lastLogin: {
            type: Date,
            default: null
        },
        deviceInfo: {
            type: String,
            default: null
        }
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
})


// make sure password is hashed before saving to db
userSchema.pre("save", async function (next) {
    const user = this as IUser;

    // hash password
    user.pin = await bcrypt.hash(user.pin, Number(envConfig.security.saltRounds));

    next();
})

userSchema.virtual('name.fullName').get(function () {
    return `${this?.name?.firstName} ${this?.name?.lastName}`;
});

const User = model<IUser>('User', userSchema);


export default User