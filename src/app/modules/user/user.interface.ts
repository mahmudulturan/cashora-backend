
export interface IName {
    firstName: string;
    lastName: string;
    fullName?: string;
}


export interface IUser {
    name: IName;
    email: string;
    phone: string;
    username: string;
    password: string;
    dateOfBirth?: string;
    profileImg?: string;
    gender?: 'male' | 'female' | 'other';
    role: 'user' | 'admin';
    status: 'active' | 'blocked';
    isEmailVerified: boolean;
    isDeleted: boolean;
}