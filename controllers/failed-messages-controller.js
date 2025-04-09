const { SUCCESS } = require("../lib/constants");
const { errorHandler } = require("../lib/error-handler");
const { failedMessagesService } = require("../services");

exports.listFailedMessages = async (req, res) => {
    try {
        const response = await failedMessagesService.listFailedMessages({ query: req.query });
        return res.status(SUCCESS).json(response);
    } catch (error) {
        console.log("Error while retrieving failed messages : ", error);
        return res.status(errorHandler(error)).json({ error: error.message });
    }
};

exports.replayMessage = async (req, res) => {
    try {
        await failedMessagesService.replayMessage({ params: req.params });
        return res.status(SUCCESS).json({ message: "Message replayed successfully" });
    } catch (error) {
        console.log("Error while replaying message : ", error);
        return res.status(errorHandler(error)).json({ error: error.message });
    }
};

exports.discardMessage = async (req, res) => {
    try {
        await failedMessagesService.discardMessage({ params: req.params });
        return res.status(SUCCESS).json({ message: "Message discarded successfully" });
    } catch (error) {
        console.log("Error while discarding message : ", error);
        return res.status(errorHandler(error)).json({ error: error.message });
    }
};