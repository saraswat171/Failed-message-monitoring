require("dotenv").config();

const { Command } = require("commander");
const { RabbitMQConfigObj } = require("../rabbitmq/rabbitmq-config.js");
const { logger, handle_error } = require("../../lib/event-error");
const PoisonMessageRelay = require("../poison-message-relay.js");
const { dbConnection } = require("../../config");

const program = new Command();

program
    .name("replay-messages")
    .description("Replay messages with optional limit or a specific poison message ID")
    .option("--limit <limit>", "Maximum number of messages to replay")
    .option("--poison-message-id <poisonMessageId>", "ID of a specific poison message to replay")
    .action(async (options) => {
        let { limit, poisonMessageId } = options;
        try {
            limit = parseInt(limit || process.env.REPLAY_MESSAGE_LIMIT);
            if (!limit || isNaN(limit)) throw new Error("Limit is not defined. Please provide a limit using the --limit option or set it in the .env file.");
            logger.info(poisonMessageId ? `Replaying message with id ${poisonMessageId}` : `Replaying messages with limit: ${limit}`);

            await dbConnection.checkConnection();
            await RabbitMQConfigObj.checkPreRequisites();
            const relayer = new PoisonMessageRelay();
            await relayer.execute(limit, poisonMessageId);

            process.exit(0);
        } catch (error) {
            handle_error(error);
        }
    });

program.on('--help', () => {
    console.log('');
    logger.info('Examples:');
    logger.success('  $ npm run replay-messages -- --limit 10');
    logger.success('  $ npm run replay-messages -- --poison-message-id b7d03090-8b4d-4a6b-bc7c-af74c2d9c7e8');
    console.log('');
});

program.parse(process.argv);