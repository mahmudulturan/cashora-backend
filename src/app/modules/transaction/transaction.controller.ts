import { transactionService } from "./transaction.service";
import httpStatus from "../../constants/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";


const sendMoney = catchAsync(async (req, res) => {
    const transaction = await transactionService.sendMoney(req.user?.userId, req.body);
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

const cashOut = catchAsync(async (req, res) => {
    const transaction = await transactionService.cashOut(req.user?.userId, req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Cash out successful',
        data: transaction
    });
});

const getHistory = catchAsync(async (req, res) => {
    const transaction = await transactionService.getHistory(req.user?.userId, req.query);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Transaction history fetched successfully',
        data: transaction
    });
});

const getAllHistory = catchAsync(async (req, res) => {
    const transaction = await transactionService.getAllHistory(req.query);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Transaction history fetched successfully',
        data: transaction
    });
});

export const transactionController = {
    sendMoney,
    cashIn,
    cashOut,
    getHistory,
    getAllHistory
}


