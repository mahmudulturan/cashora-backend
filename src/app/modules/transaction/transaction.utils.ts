interface TransactionFees {
    transactionFee: number;
    adminFee: number;
    agentCommission: number;
}

export const calculateTransactionFees = (amount: number, type: 'send_money' | 'cash_out' | 'cash_in'): TransactionFees => {
    const fees: TransactionFees = {
        transactionFee: 5,
        adminFee: 5,
        agentCommission: 0
    };

    if (type === 'send_money') {
        fees.transactionFee = amount > 100 ? 5 : 0;
    } else if (type === 'cash_out') {
        fees.transactionFee = amount * 0.015;
        fees.agentCommission = amount * 0.01;
        fees.adminFee += amount * 0.005;
    } else if (type === 'cash_in') {
        fees.transactionFee = 0;
        fees.adminFee = 0;
        fees.agentCommission = 0;
    } 

    return fees;
};

