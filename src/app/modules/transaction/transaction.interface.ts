import { Types, Document } from "mongoose";

export interface ITransaction extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    amount: number;
    fees: ITransactionFees;
    note: string;
    type: 'send_money' | 'cash_in' | 'cash_out' | 'agent_recharge' | 'agent_withdraw';
}

export interface ITransactionFees {
    transactionFee: number;
    adminFee: number;
    agentCommission: number;
}

export interface ITransactionPayload {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    amount: number;
    note: string;
}
