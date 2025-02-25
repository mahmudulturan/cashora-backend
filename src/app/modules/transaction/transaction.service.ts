import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import User from "../user/user.model";
import { ITransaction, ITransactionPayload } from "./transaction.interface";
import Transaction from "./transaction.model";
import { calculateTransactionFees } from "./transaction.utils";

const sendMoneyFromDB = async (payload: ITransactionPayload): Promise<ITransaction> => {
    const session = await Transaction.startSession();

    try {
        session.startTransaction();

        // Check if sender and receiver exist
        const [sender, receiver] = await Promise.all([
            User.findById(payload.sender),
            User.findById(payload.receiver)
        ]);

        if (!sender || !receiver) {
            throw new AppError(httpStatus.NOT_FOUND, 'User not found');
        }

        // Check if sender has sufficient balance
        if (sender.balance < payload.amount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
        }

        const fees = calculateTransactionFees(payload.amount, 'send_money');

        // Create transaction
        const transaction = await Transaction.create([{
            ...payload,
            fees,
            type: 'send_money'
        }], { session });

        // Update balances
        await Promise.all([
            User.findByIdAndUpdate(
                payload.sender,
                { $inc: { balance: -(payload.amount + fees.transactionFee) } },
                { session }
            ),
            User.findByIdAndUpdate(
                payload.receiver,
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


export const transactionService = {
    sendMoneyFromDB
}
