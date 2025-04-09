require("dotenv").config();
const { Command } = require("commander");
const consumer = require("../workers/consumer");
const { RabbitMQConfigObj } = require("../rabbitmq/rabbitmq-config.js");
const { logger, handle_error } = require("../../lib/event-error");
const { dbConnection } = require("../../config");

const program = new Command();

program
    .name("handle-messages")
    .option("--limit <limit>", "Maximum number of messages to handle")
    .description("Handle messages with an optional limit")
    .action(async (options) => {
        let { limit } = options;
        try {
            limit = parseInt(limit || process.env.CONSUME_MESSAGE_LIMIT);
            if (!limit || isNaN(limit)) throw new Error("Limit is not defined. Please provide a limit using the --limit option or set it in the .env file.");
            logger.info(`Handling messages with limit: ${limit}`);

            await dbConnection.checkConnection();
            await RabbitMQConfigObj.checkPreRequisites();
            await consumer.init(limit);
        } catch (error) {
            handle_error(error);
        }
    });

program.on('--help', () => {
    console.log('');
    logger.info('Examples:');
    logger.success('  $ npm run handle-messages -- --limit 10');
    console.log('');
});

program.parse(process.argv);