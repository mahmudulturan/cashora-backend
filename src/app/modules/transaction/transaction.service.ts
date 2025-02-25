import QueryBuilder from "../../builder/QueryBuilder";
import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import { getPopulateFields } from "../../utils/getPopulateFields";
import User from "../user/user.model";
import { ITransactionPayload } from "./transaction.interface";
import Transaction from "./transaction.model";
import { calculateTransactionFees } from "./transaction.utils";

const sendMoney = async (senderId: string, payload: ITransactionPayload) => {
    const session = await Transaction.startSession();

    try {
        session.startTransaction();

        // Check if sender and receiver exist
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findOne({ $and: [{ phone: payload.receiver }, { role: 'user' }] })
        ]);

        if (!sender || !receiver) {
            throw new AppError(httpStatus.NOT_FOUND, `${!sender ? 'Sender' : 'Receiver'} not found`);
        }

        // Check if sender has sufficient balance
        if (sender.balance < payload.amount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
        }

        const fees = calculateTransactionFees(payload.amount, 'send_money');

        // Create transaction
        const transaction = await Transaction.create([{
            fees,
            sender: senderId,
            type: 'send_money',
            receiver: receiver._id,
            amount: payload.amount,
            note: payload.note
        }], { session });

        // Update balances
        await Promise.all([
            User.findByIdAndUpdate(
                senderId,
                { $inc: { balance: -(payload.amount + fees.transactionFee) } },
                { session }
            ),
            User.findByIdAndUpdate(
                receiver._id,
                { $inc: { balance: payload.amount } },
                { session }
            )
        ]);

        await session.commitTransaction();
        return transaction[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


const cashIn = async (agentId: string, payload: ITransactionPayload) => {
    const session = await Transaction.startSession();

    try {
        session.startTransaction();

        const [agent, user] = await Promise.all([
            User.findById(agentId),
            User.findOne({ $and: [{ phone: payload.receiver }, { role: 'user' }] })
        ]);

        if (!agent || !user) {
            throw new AppError(httpStatus.NOT_FOUND, `${!agent ? 'Agent' : 'Receiver'} not found`);
        }

        if (agent.balance < payload.amount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
        }

        const transaction = await Transaction.create([{
            type: 'cash_in',
            sender: agentId,
            receiver: user._id,
            amount: payload.amount,
            note: payload.note
        }], { session });

        await Promise.all([
            User.findByIdAndUpdate(
                agentId,
                { $inc: { balance: -payload.amount } },
                { session }
            ),
            User.findByIdAndUpdate(
                user._id,
                { $inc: { balance: payload.amount } },
                { session }
            )
        ]);

        await session.commitTransaction();
        return transaction[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


const cashOut = async (userId: string, payload: ITransactionPayload) => {
    const session = await Transaction.startSession();

    try {
        session.startTransaction();

        const [agent, user] = await Promise.all([
            User.findOne({ $and: [{ phone: payload.receiver }, { role: 'agent' }] }),
            User.findById(userId)
        ]);

        if (!agent || !user) {
            throw new AppError(httpStatus.NOT_FOUND, `${!agent ? 'Agent' : 'User'} not found`);
        }

        if (user.balance < payload.amount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
        }

        const fees = calculateTransactionFees(payload.amount, 'cash_out');

        const transaction = await Transaction.create([{
            sender: userId,
            receiver: agent._id,
            type: 'cash_out',
            amount: payload.amount,
            note: payload.note,
            fees
        }], { session });

        await Promise.all([
            User.findByIdAndUpdate(
                userId,
                { $inc: { balance: -(payload.amount + fees.transactionFee) } },
                { session }
            ),
            User.findByIdAndUpdate(
                agent._id,
                { $inc: { balance: payload.amount, income: fees.agentCommission } },
                { session }
            )
        ]);

        await session.commitTransaction();
        return transaction[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


const getHistory = async (userId: string, query: Record<string, any>) => {
    const { populate, exceptFields } = getPopulateFields(query);

    const transactionsQuery = new QueryBuilder(
        Transaction.find({ $or: [{ sender: userId }, { receiver: userId }] }).populate(populate),
        query
    )
        .search(['sender', 'receiver']).paginate().filter(exceptFields).sort().fields();

    const result = await transactionsQuery.modelQuery;
    const meta = await transactionsQuery.countTotal();

    return {
        meta,
        result
    };
};

export const transactionService = {
    sendMoney,
    cashIn,
    cashOut,
    getHistory
}
