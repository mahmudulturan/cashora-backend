interface TransactionFees {
    transactionFee: number;
    adminFee: number;
    agentCommission: number;
}

export const calculateTransactionFees = (amount: number, type: 'send_money' | 'cash_out'): TransactionFees => {
    const fees: TransactionFees = {
        transactionFee: 0,
        adminFee: 0,
        agentCommission: 0
    };

    if (type === 'send_money') {
        fees.adminFee = amount > 100 ? 5 : 0;
    } else if (type === 'cash_out') {
        fees.agentCommission = amount * 0.01;
        fees.adminFee += amount * 0.005;
    }
    
    fees.transactionFee = fees.agentCommission + fees.adminFee;
    return fees;
};

