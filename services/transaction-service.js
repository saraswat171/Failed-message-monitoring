const { transactionRepositoryObj } = require("../repositories/transaction-repositories");

exports.handleTransaction = async (callback) => {
    const transaction = await transactionRepositoryObj.startTransaction();
    try {
        await callback(transaction);
        await transactionRepositoryObj.commitTransaction(transaction);
    } catch (error) {
        await transactionRepositoryObj.rollbackTransaction(transaction);
        throw error;
    }
};