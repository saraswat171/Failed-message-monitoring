module.exports = {
    baseRepository: require("./base-repositories"),
    transactionRepository: require("./transaction-repositories"),
    poisonMessageRepository: require("./poison-message-repositories").poisonMessageRepository,
};