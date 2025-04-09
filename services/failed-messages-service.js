const producer = require("../message-bus/workers/producer");
const { poisonMessageRepository } = require("../repositories");


exports.listFailedMessages = async (payload) => {
    let { endpoint, page, limit } = payload.query;

    page = parseInt(page ?? 1);
    limit = parseInt(limit ?? 10);

    const { rows: failedMessages, count: filteredTotal } = await poisonMessageRepository.search({
        retry_endpoint: endpoint,
        page,
        limit,
    });

    return {
        filtered_total: filteredTotal,
        current_page: page,
        per_page: limit,
        failedMessages,
    };

}

exports.replayMessage = async (payload) => {
    const { uuid } = payload.params;

    const message = await poisonMessageRepository.getPoisonMessageById(uuid);
    console.log('message: ', message);
    await producer.publishMessages([message]);
}

exports.discardMessage = async (payload) => {
    const { uuid } = payload.params;

    const message = await poisonMessageRepository.getPoisonMessageById(uuid);
    message.markAsDiscarded();
    await message.save();
}