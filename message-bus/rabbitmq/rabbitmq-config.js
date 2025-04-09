const amqp = require("amqplib");
const ora = require('ora-classic');

/**
 * @typedef {Object} RabbitMQConfigParams
 * @property {string} username - RabbitMQ username.
 * @property {string} password - RabbitMQ password.
 * @property {string} host - RabbitMQ host.
 * @property {number} port - RabbitMQ port.
 * @property {string} vhost - RabbitMQ virtual host.
 * @property {string} appName - RabbitMQ app name.
 * @property {string} directExchange - RabbitMQ direct exchange name.
 * @property {string} errorQueue - RabbitMQ error queue name.
 * @property {string} errorBindingKey - RabbitMQ error queue binding key.
 * @property {number} immediateRetriesNumber - Number of immediate retries for failed messages.
 */
const config = {
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    dsn: process.env.RABBITMQ_DSN,
    vhost: process.env.RABBITMQ_VHOST,
    appName: process.env.APP_NAME,
    fanoutExchange: process.env.RABBITMQ_FANOUT_EXCHANGE,
    directExchange: process.env.RABBITMQ_DIRECT_EXCHANGE,
    errorQueue: process.env.RABBITMQ_ERROR_QUEUE,
    errorBindingKey: process.env.RABBITMQ_ERROR_BINDING_KEY,
    immediateRetriesNumber: process.env.FAILED_MESSAGE_IMMEDIATE_RETRIES
}

/**
 * Class representing RabbitMQ configuration and utility methods.
 */
class RabbitMQConfig {
    /**
     * Create a RabbitMQConfig instance.
     * @param {RabbitMQConfigParams} config - The configuration object.
     * @param {Object} ora - The ora instance for spinners.
     */
    constructor(config, ora) {
        this.config = config;
        this.ora = ora;
    }

    /**
     * Check that all required configuration variables are present.
     * Exits the process if any variables are missing.
     */
    async checkPreRequisites() {
        const spinner = this.ora('Checking prerequisites...').start()
        const requiredVariables = ["username", "password", "host", "port", "vhost", "appName", "fanoutExchange", "directExchange", "errorQueue", "errorBindingKey", "immediateRetriesNumber"];
        const missingVariables = requiredVariables.filter(variable => !this.config[variable]);
        if (missingVariables.length === 0) spinner.succeed('All prerequisites are met for RabbitMQ.');
        else {
            missingVariables.forEach(variable => { spinner.fail(`Missing required environment variable: ${variable}`) })
            process.exit(1); // Exit the process with an error code
        }
    }

    /**
    * Get the configuration object.
    * @returns {RabbitMQConfigParams} The configuration object containing RabbitMQ configuration parameters:
    * - username: RabbitMQ username.
    * - password: RabbitMQ password.
    * - host: RabbitMQ host.
    * - port: RabbitMQ port.
    * - vhost: RabbitMQ virtual host.
    * - appName: RabbitMQ app name.
    * - directExchange: RabbitMQ direct exchange name.
    * - errorQueue: RabbitMQ error queue name.
    * - errorBindingKey: RabbitMQ error queue binding key.
    * - immediateRetriesNumber: Number of immediate retries for failed messages.
    */
    getConfig() {
        return this.config;
    }

    /**
     * Get the RabbitMQ connection string.
     * @returns {string} The connection string.
     */
    getConnectionString() {
        return `${this.config.dsn}`;
    }

    /**
     * Get the connection parameters for RabbitMQ.
     * @returns {Object} The connection parameters.
     */
    getConnectionParams() {
        return {
            credentials: amqp.credentials.plain(this.config.username, this.config.password),
            heartbeat: 30, // Set the heartbeat interval for the connection
        };
    }
}

module.exports = {
    RabbitMQConfig,
    RabbitMQConfigObj: new RabbitMQConfig(config, ora)
}