const { RabbitMQConfigObj } = require("../rabbitmq/rabbitmq-config");
const { RabbitMQConfigurer } = require("../rabbitmq/rabbitmq-configurer");
const { RabbitMQConnectionObject } = require('../rabbitmq/rabbitmq-connection');

class Producer {
    /**
     * Create a Producer instance.
     * @param {Object} logger - A logger object for logging messages.
     */
    constructor(logger = console) {
        this.config = RabbitMQConfigObj.getConfig();
        this.connection = RabbitMQConnectionObject;
        this.logger = logger;
    }

    /**
     * Connect to RabbitMQ and configure the necessary exchanges and queues.
     */
    async _connect() {
        await this.connection.connect();
        await new RabbitMQConfigurer(this.connection).configure();
    }

    /**
     * Publish a list of messages.
     * @param {Array} messages - The list of messages to be published.
     */
    async publishMessages(messages) {
        await this._connect();

        for (const message of messages) {
            await this._publisher()(message);
        }

        await this._close();
    }

    /**
     * Publish a single message with error handling.
     * @param {Object} poisonMessage - The message object to be published.
     */
    _publisher() {
        return async (poisonMessage) => {
            let properties = {};
            try {
                const { message_type, exchange, routing_key = "" } = poisonMessage.getDeliveryMetadata();
                const messageId = poisonMessage.getMessageId();
                const appId = poisonMessage.getAppId();
                const payload = poisonMessage.getPayload();
                properties = {
                    messageId,
                    appId,
                    type: message_type,
                    contentType: "application/json",
                    persistent: true,
                }

                const isPublished = await this.connection.publish(exchange, routing_key, JSON.stringify(payload), properties);
                if (!isPublished) throw new Error('Message could not be published.');

                this.logger.log(`This message is sent to exchange ${exchange}`, payload);

                await poisonMessage.markAsReplayed();
                await poisonMessage.save();
            } catch (error) {
                this.logger.error(
                    `Error while publishing message ${properties.type} with id ${properties.messageId}`,
                    error
                );
            }
        }
    }

    /**
     * Close the RabbitMQ channel.
     */
    async _close() {
        await this.connection.closeChannel();
    }
}

module.exports = new Producer();