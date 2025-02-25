import { transactionService } from "./transaction.service";
import httpStatus from "../../constants/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";


const sendMoney = catchAsync(async (req, res) => {
    const transaction = await transactionService.sendMoney(req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Money sent successfully',
        data: transaction
    });
});

const cashIn = catchAsync(async (req, res) => {
    const transaction = await transactionService.cashIn(req.user?.userId, req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Cash in successful',
        data: transaction
    });
});



export const transactionController = {
    sendMoney,
    cashIn
}


