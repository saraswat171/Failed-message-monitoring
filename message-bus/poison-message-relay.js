const { isValidUUID } = require('../lib/util');
const { poisonMessageRepository } = require('../repositories/poison-message-repositories');
const producer = require('./workers/producer');

class PoisonMessageRelay {
    /**
     * Create an PoisonMessageRelay instance.
     * @param {Object} producer - A producer object for publishing messages.
     */
    constructor() {
        this.producer = producer;
        this.poisonMessageRepository = poisonMessageRepository;
    }

    async _getMessageWithMessageId(poisonMessageId) {
        if (!isValidUUID(poisonMessageId)) throw new Error('Invalid poison message ID.');
        const response = await this.poisonMessageRepository.getPoisonMessageById(poisonMessageId);
        return response ? [response] : [];
    }

    async _getPendingMessagesWithLimit(messagesCount) {
        return await this.poisonMessageRepository.getPendingPoisonMessagesByLimit(messagesCount);
    }

    /**
     * Execute the relay of poison messages.
     * @param {number} limit - The maximum number of messages to process.
     * @param {string} poisonMessageId - The message identifier to process.
     */
    async execute(limit, poisonMessageId) {
        try {
            let messages = [];

            if (poisonMessageId) messages = await this._getMessageWithMessageId(poisonMessageId);
            else messages = await this._getPendingMessagesWithLimit(limit);

            if (messages.length === 0) return console.log(poisonMessageId ? `INFO: No message with id ${poisonMessageId} was found.` : "INFO: No messages pending to replay.");

            await this.producer.publishMessages(messages);

            console.log('Done publishing messages');
        } catch (error) {
            console.error('Error executing PoisonMessageRelay:', error);
        }
    }
}

module.exports = PoisonMessageRelay;
