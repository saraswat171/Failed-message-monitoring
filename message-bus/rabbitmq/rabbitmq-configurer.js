const { RabbitMQConfigObj } = require("./rabbitmq-config");

class RabbitMQConfigurer {
    /**
     * Create a RabbitMQConfigurer instance.
     * @param {Object} RabbitMqConnection - The RabbitMQ connection object.
     */
    constructor(rabbitMqConnection) {
        this.config = RabbitMQConfigObj.getConfig();
        this.connection = rabbitMqConnection;
    }

    /**
     * Configure the RabbitMQ exchanges and queues.
     */
    async configure() {
        await this.connection.exchange(this.config.fanoutExchange, 'fanout');
        await this.connection.exchange(this.config.directExchange, 'direct');

        await this.connection.queue(this.config.directExchange, this.config.errorQueue, this.config.errorBindingKey, { durable: true });
    }
}

module.exports = {
    RabbitMQConfigurer
}