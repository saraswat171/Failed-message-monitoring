const { poisonMessageRepository } = require("../repositories/poison-message-repositories");

class MessageHandler {
    /**
     * Create a MessageHandler instance.
     */
    constructor() {
        this.poisonMessageRepository = poisonMessageRepository
    }

    /**
     * Handle an incoming message.
     * @param {Object} message - The message to be handled.
     * @param {number} immediateRetriesCount - The maximum number of retry attempts.
     * @returns {boolean} True if the message was handled successfully, otherwise false.
     */
    async handleMessage(message, immediateRetriesCount) {
        const parsedMessage = JSON.parse(message.content.toString());
        console.log("INFO: Handling message with the following parsed content:", parsedMessage);
     
        let counter = 0, err;
        while (counter <= immediateRetriesCount) {
            try {
                const messageId = message.properties.messageId;
                console.log(`INFO: Handling message with messageId ${messageId}`);
                const poissonMessage = await this.poisonMessageRepository.storePosionMessage(messageId, parsedMessage , message.properties?.headers);
                console.log(`INFO: Successfully stored poison message with poison-message-id ${poissonMessage.poison_message_id}`);
                return true;
            } catch (error) {
                err = error;
                counter++;
            }
        }

        throw err;
    }
}

exports.messageHandler = new MessageHandler()
