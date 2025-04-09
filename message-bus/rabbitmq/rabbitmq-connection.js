const amqp = require("amqplib");
const ora = require('ora-classic');
const EventEmitter = require('events');

const { RabbitMQConfigObj } = require("./rabbitmq-config");

class RabbitMQConnection {
    /**
     * Create a RabbitMQConnection instance.
     * @param {Object} logger - The logger object for logging messages.
     */
    constructor(logger = console) {
        this.rabbitMqConfig = RabbitMQConfigObj;
        this.config = this.rabbitMqConfig.getConfig();
        this.rabbitMqEvents = new EventEmitter();
        this.maxReconnectNumber = 3;
        this.reconnectNumber = 0;
        this.isMaxReconnectPolicyApplied = false;
        this.logger = logger;
        this.ora = ora;
        this.connection = null;
        this.channel = null;
        this.timeout = null;
    }

    /**
     * Connect to RabbitMQ server and set up connection and channel.
     */
    async connect() {
        const spinner = this.ora('Checking rabbitmq connection...').start()
        if (this.timeout) clearTimeout(this.timeout);

        try {
            this.connection = await this.createConnection();

            this.connection.on("close", this._handleClose.bind(this));
            this.connection.on("error", this._handleError.bind(this));
            spinner.succeed("RabbitMQ is connected.");

            this.channel = await this.createChannel();

            this.rabbitMqEvents.emit("connected");
            this.reconnectNumber = 0;
        } catch (error) {
            spinner.fail(`Failed to establish connection to RabbitMQ: ${error.message || error}`);
            await this._reconnect();
        }
    }

    /**
     * Sets the maximum reconnection attempts and applies the reconnection policy.
     *
     * @param maxReconnectNumber Maximum reconnection attempts.
     * @return Updated instance with the reconnection policy.
     */
    withReconnectionPolicy(maxReconnectNumber = 3) {
        this.isMaxReconnectPolicyApplied = true;
        this.maxReconnectNumber = maxReconnectNumber;
        return this;
    }

    /**
     * Assert an exchange on the channel.
     * @param {string} exchange - The exchange name.
     * @param {string} exchangeType - The exchange type (e.g., 'fanout', 'direct').
     */
    async exchange(exchange, exchangeType) {
        await this.channel?.assertExchange(exchange, exchangeType, { durable: true });
    }

    /**
     * Assert a queue and bind it to an exchange on the channel.
     * @param {string} exchange - The exchange name.
     * @param {string} queue - The queue name.
     * @param {string} [routingKey=""] - The routing key for the binding.
     * @param {Object} options - Queue options.
     */
    async queue(exchange, queue, routingKey = "", options) {
        await this.channel?.assertQueue(queue, options);
        await this.channel?.bindQueue(queue, exchange, routingKey);
    }

    /**
     * Create a new connection to RabbitMQ server.
     * @returns {Object} The connection object.
     */
    async createConnection() {
        const connectionString = this.rabbitMqConfig.getConnectionString();
        console.log('connectionString: ', connectionString);
        const connectionParams = this.rabbitMqConfig.getConnectionParams();
        return amqp.connect(connectionString, connectionParams);
    }

    /**
     * Get the current channel.
     * @returns {Object} The channel object.
     */
    getChannel() {
        return this.channel;
    }

    /**
     * Create a new channel on the connection.
     * @returns {Object} The channel object.
     */
    async createChannel() {
        if (!this.connection) throw new Error("RabbitMQ connection has not been established yet.");
        const channel = await this.connection.createChannel();
        this.logger.log("Channel created.");
        return channel;
    }

    /**
     * Close the current channel.
     */
    async closeChannel() {
        await this.channel?.close();
        this.channel = null;
        this.logger.log("Channel closed.");
    }

    /**
     * Publish a message to an exchange with a specific binding key.
     * @param {string} exchange - The exchange name.
     * @param {string} bindingKey - The binding key.
     * @param {string|Buffer} content - The message content.
     * @param {Object} properties - Message properties.
     * @returns {boolean} Whether the message was successfully published.
     */
    async publish(exchange, bindingKey, content, properties) {
        return this.channel?.publish(exchange, bindingKey, Buffer.from(content), properties);
    }

    /**
     * Handle the connection close event.
     * @private
     */
    async _handleClose() {
        this.logger.log("Disconnected from RabbitMQ");
        if (this.timeout) clearTimeout(this.timeout);
        await this._reconnect();
    }

    /**
     * Handle the connection error event.
     * @param {Error} e - The error object.
     * @private
     */
    async _handleError(e) {
        this.logger.log("Error in RabbitMQ connection", e);
        if (this.timeout) clearTimeout(this.timeout);
        await this._reconnect();
    }

    /**
     * Attempt to reconnect to RabbitMQ server after a delay.
     * @private
     */
    async _reconnect() {
        return new Promise(resolve => {
            this.timeout = setTimeout(async () => {
                this.reconnectNumber++;

                if (this.isMaxReconnectPolicyApplied && this._hasExceededMaxReconnects(this.reconnectNumber)) process.exit(1);

                this.logger.log("Reconnecting to RabbitMQ...", "Attempt:", this.reconnectNumber, new Date());
                await this.connect(this.isMaxReconnectPolicyApplied);

                resolve();
            }, 5000); // Wait for 5 seconds before attempting to reconnect
        });
    }

    /**
     * @return {boolean} - True if reconnection attempts exceed the limit, otherwise false.
     * @private
     */
    _hasExceededMaxReconnects(reconnectNumber) {
        if (reconnectNumber > this.maxReconnectNumber) return true;
        return false;
    }
}

module.exports = {
    RabbitMQConnection,
    RabbitMQConnectionObject: new RabbitMQConnection(),
}