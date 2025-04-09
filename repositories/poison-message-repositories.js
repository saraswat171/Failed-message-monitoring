const { sequelize } = require("../config/db-connection");
const { poison_message } = require("../models");
const { PoisonMessageState } = require("../models/poison-message");
const { BaseRepository } = require("./base-repositories");

const { Op } = require("sequelize");

class PoisonMessageRepository extends BaseRepository {

    constructor(payload) {
        super(payload);
    }

    async getPendingPoisonMessagesByLimit(limit) {
        let criteria = {
            state: { [Op.eq]: PoisonMessageState.ENUM.PENDING }
        };
        const { rows } = await this.findAndCountAll(criteria, [], 0, limit, [], true, {});
        return rows;
    }

    async getPoisonMessageById(poisonMessageId) {
        const criteria = { poison_message_id: { [Op.eq]: poisonMessageId } };
        return this.findOne(criteria, [], true, {});
    }

    async storePosionMessage(messageId, message, messageHeaders) {
        const poisonMessage = {
            message_id: messageId,
            endpoint: messageHeaders.endpoint,
            exception_details: messageHeaders.exception_details,
            retry_endpoint: messageHeaders.endpoint.name,
            payload: message,
        }
        return this.create(poisonMessage);
    }

    async search({ retry_endpoint, page, limit }) {
        let criteria = {
            state: { [Op.ne]: PoisonMessageState.ENUM.DISCARD }
        };

        if (retry_endpoint) {
            criteria.retry_endpoint = retry_endpoint;
        }

        const include = []

        const offset = limit * (page - 1);

        const order = [['created_at', 'DESC']];

        return await this.findAndCountAll(criteria, include, offset, limit, order, true, {});
    }
}

module.exports = {
    poisonMessageRepository: new PoisonMessageRepository({
        model: poison_message,
        dbConnection: sequelize
    }),
};