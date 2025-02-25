import { model, Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";


const transactionFeesSchema = new Schema({
    transactionFee: { type: Number, default: 0 },
    adminFee: { type: Number, default: 0 },
    agentCommission: { type: Number, default: 0 }
}, {
    _id: false
});

const transactionSchema = new Schema<ITransaction>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['send_money', 'cash_in', 'cash_out', 'agent_recharge', 'agent_withdraw'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 50
    },
    note: {
        type: String
    },
    fees: {
        type: transactionFeesSchema,
        default: {
            transactionFee: 0,
            adminFee: 0,
            agentCommission: 0
        }
    }
}, {
    timestamps: true
});


const Transaction = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
