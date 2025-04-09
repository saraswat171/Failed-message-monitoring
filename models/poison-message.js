const { Model } = require("sequelize");
const { ENUM } = require("../lib/enum");

class PoisonMessageState extends ENUM {
    static ENUM = {
        PENDING: "pending",
        DISCARD:"discard",
        REPLAYED: "replayed",
    };
}

module.exports = (sequelize, DataTypes) => {

    class PoisonMessage extends Model {
        markAsReplayed() {
            this.state = PoisonMessageState.ENUM.REPLAYED;
            this.replayed_at = new Date();
        }

        markAsDiscarded() {
            this.state = PoisonMessageState.ENUM.DISCARD;
        }

        getMessageId() {
            const messageId = this.getDataValue("message_id");

            if (!messageId) {
                throw new Error("Message ID is invalid.");
            }

            return messageId;
        }

        getDeliveryMetadata() {
            const endpoint = this.getDataValue("endpoint");

            if (!endpoint) {
                throw new Error("Endpoint does not exist.");
            }

            const deliveryMetadata = endpoint.delivery_metadata;

            if (deliveryMetadata === null) {
                throw new Error("Delivery metadata does not exist.")
            }
            if (typeof deliveryMetadata !== "object") {
                throw new Error("Delivery metadata is not an object.")
            }
            if (!deliveryMetadata.hasOwnProperty("message_type")) {
                throw new Error("Delivery metadata does not have a message_type property.");
            }
            if (!deliveryMetadata.hasOwnProperty("exchange")) {
                throw new Error("Delivery metadata does not have an exchange property.");
            }
            return deliveryMetadata;
        }

        getAppId() {
            const endpoint = this.getDataValue("endpoint");

            // if (endpoint === null) {
            //     throw new Error("Endpoint does not exist.");
            // }

            const appId = endpoint?.name;

            // if (appId === null) {
            //     throw new Error("App name does not exist.")
            // }

            return appId;
        }

        getPayload() {
            return this.getDataValue("payload");
        }
    }

    PoisonMessage.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        poison_message_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        message_id: {
            type: DataTypes.STRING,
        },
        payload: {
            type: DataTypes.JSON,
        },
        exception_details: {
            type: DataTypes.JSON,
        },
        endpoint: {
            type: DataTypes.JSON,
        },
        retry_endpoint: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.ENUM(PoisonMessageState.getValues()),
            allowNull: false,
            defaultValue: PoisonMessageState.ENUM.PENDING,
            validate: {
                isIn: {
                    args: [PoisonMessageState.getValues()],
                    msg: "State is invalid.",
                }
            }
        },
        replayed_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    args: true,
                    msg: "Replayed at must be a valid date."
                }
            }
        }
    }, {
        sequelize,
        timestamps: true,
        underscored: true,
        paranoid: true,
        tableName: "poison_message",
        createdAt: "created_at",
        updatedAt: false,
        deletedAt: "deleted_at",
    });

    return PoisonMessage;
};

module.exports.PoisonMessageState = PoisonMessageState;