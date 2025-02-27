import httpStatus from "../../constants/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { statsService } from "./stats.service";

const getAdminStats = catchAsync(async (req, res) => {
    const stats = await statsService.getAdminStatsFromDB();

    sendResponse(res, {
        status: httpStatus.OK,
        success: true,
        message: "Admin stats fetched successfully",
        data: stats,
    });
});

export const statsController = {
    getAdminStats,
};

