const { RabbitMQConfigObj } = require("../rabbitmq/rabbitmq-config");
const { RabbitMQConfigurer } = require("../rabbitmq/rabbitmq-configurer");
const { RabbitMQConnectionObject } = require('../rabbitmq/rabbitmq-connection');
const { messageHandler } = require("../inbox-message-handler");

class Consumer {
    constructor(logger = console) {
        this.config = RabbitMQConfigObj.getConfig();
        this.connection = RabbitMQConnectionObject;
        this.messageHandler = messageHandler;
        this.logger = logger;
        this.channel = null;
        this.prefetchLimit = 10;
        this.connection.rabbitMqEvents.on("connected", this._consume.bind(this));
    }

    /**
     * Initializes the consumer, connects to RabbitMQ, and sets up the channel.
     * @param {number} limit - The prefetch limit for the RabbitMQ channel.
     */
    async init(limit) {
        try {
            this.prefetchLimit = limit;
            await this.connection.connect();
        } catch (error) {
            this.logger.error("Failed to initialize consumer:", error);
        }
    }

    /**
     * Connect to RabbitMQ and configure the necessary exchanges and queues.
     */
    async _consume() {
        this.channel = this.connection.getChannel();
        await new RabbitMQConfigurer(this.connection).configure();
        this.channel.prefetch(this.prefetchLimit);
        await this.startConsuming();
        this.logger.log(`Waiting for messages in ${this.config.errorQueue}...`);
    }

    /**
     * Starts consuming messages from the primary queue.
     */
    async startConsuming() {
        await this.channel.consume(this.config.errorQueue, async (message) => {
            if (message === null) return;

            this.logger.log("\n\n================= NEW MESSAGE CONSUMING AT", new Date(), "=================");

            try {
                await this.messageHandler.handleMessage(message, parseInt(this.config.immediateRetriesNumber));
                this.channel.ack(message);
            } catch (error) {
                this.logger.error(`ERROR: RecoverabilityExecutor rejecting message ${message?.properties?.messageId} because processing failed due to an exception:\n`, error);
                this.logger.log("\n INFO: Not handling poison message:", message, "\n Content:", message?.content?.toString(), "\n");

                this.channel.reject(message, false);
            }
        });
    }
}


module.exports = new Consumer();