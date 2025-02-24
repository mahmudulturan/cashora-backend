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
        unique: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 11,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    dateOfBirth: {
        type: String
    },
    profileImg: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    isEmailVerified: {
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
    user.password = await bcrypt.hash(user.password, Number(envConfig.security.saltRounds));

    next();
})

userSchema.virtual('name.fullName').get(function () {
    return `${this?.name?.firstName} ${this?.name?.lastName}`;
});

const User = model<IUser>('User', userSchema);


export default User