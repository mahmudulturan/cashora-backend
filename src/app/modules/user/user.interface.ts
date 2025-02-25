
export interface IName {
    firstName: string;
    lastName: string;
    fullName?: string;
}


export interface IUser {
    name: IName;
    email: string;
    phone: string;
    pin: string;
    nid: string;
    role: 'user' | 'agent' | 'admin';
    balance: number;
    income: number;
    status: 'pending' | 'active' | 'blocked';
    isLoggedIn: boolean;
    isDeleted: boolean;
}       