const { Sequelize } = require("sequelize");
const { CONFLICT, BAD_REQUEST, NOT_FOUND, NO_CONTENT, INTERNAL_SERVER_ERROR } = require("./constants");
const { BadRequest, NotFound, NoContent, Conflict } = require("./error");


exports.errorHandler = (error) => {
    switch (true) {
        case error instanceof Sequelize.UniqueConstraintError:
            error.message = getErrorMessage(error);
            return CONFLICT;
        case error instanceof Sequelize.ValidationError:
            error.message = getErrorMessage(error);
            return BAD_REQUEST;
        case error instanceof BadRequest:
            return BAD_REQUEST;
        case error instanceof NotFound:
            return NOT_FOUND;
        case error instanceof NoContent:
            return NO_CONTENT;
        case error instanceof Conflict:
            return CONFLICT;
        default:
            return INTERNAL_SERVER_ERROR;
    }
};

const getErrorMessage = (error) => {
    const errorMessages = error.errors.map(err => err.message);
    return errorMessages.join(', ');
};