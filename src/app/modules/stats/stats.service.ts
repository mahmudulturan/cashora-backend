import Transaction from '../transaction/transaction.model';
import User from '../user/user.model';

const getTotalSystemMoney = async (): Promise<number> => {
    const result = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    return result[0]?.total || 0;
};

const getAdminIncome = async (): Promise<number> => {
    const result = await Transaction.aggregate([
        { $match: { type: { $in: ['send_money', 'cash_out'] } } },
        { $group: { _id: null, total: { $sum: '$fees.adminFee' } } }
    ]);
    return result[0]?.total || 0;
};

const getTodayTransactions = async (): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Transaction.countDocuments({
        createdAt: { $gte: today }
    });
    return count;
};

const getTodayVolume = async (): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
};

const getUsersOverview = async () => {
    const [totalUsers, activeUsers, blockedUsers] = await Promise.all([
        User.countDocuments({ role: 'user', isDeleted: false }),
        User.countDocuments({ role: 'user', status: 'active', isDeleted: false }),
        User.countDocuments({ role: 'user', status: 'blocked', isDeleted: false })
    ]);

    return {
        totalUsers,
        activeUsers,
        blockedUsers
    };
};

const getAgentsOverview = async () => {
    const [totalAgents, activeAgents, pendingAgents] = await Promise.all([
        User.countDocuments({ role: 'agent', isDeleted: false }),
        User.countDocuments({ role: 'agent', status: 'active', isDeleted: false }),
        User.countDocuments({ role: 'agent', status: 'pending', isDeleted: false })
    ]);

    return {
        totalAgents,
        activeAgents,
        pendingApproval: pendingAgents
    };
};


const getAdminStatsFromDB = async () => {
    const [
        totalSystemMoney,
        adminIncome,
        todayTransactions,
        todayVolume,
        usersOverview,
        agentsOverview
    ] = await Promise.all([
        getTotalSystemMoney(),
        getAdminIncome(),
        getTodayTransactions(),
        getTodayVolume(),
        getUsersOverview(),
        getAgentsOverview()
    ]);

    return {
        totalSystemMoney,
        adminIncome,
        todayTransactions,
        todayVolume,
        usersOverview,
        agentsOverview
    };
}

export const statsService = {
    getAdminStatsFromDB
};