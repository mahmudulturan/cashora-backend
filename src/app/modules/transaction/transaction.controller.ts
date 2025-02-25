import { transactionService } from "./transaction.service";
import httpStatus from "../../constants/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";


const sendMoney = catchAsync(async (req, res) => {
    const transaction = await transactionService.sendMoneyFromDB(req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Money sent successfully',
        data: transaction
    });
});


export const transactionController = {
    sendMoney
}


