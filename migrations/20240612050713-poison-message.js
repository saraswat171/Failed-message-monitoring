"use strict";

const { PoisonMessageState } = require('../models/poison-message');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("poison_message", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poison_message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4
      },
      message_id: {
        type: Sequelize.STRING,
      },
      payload: {
        type: Sequelize.JSON,
      },
      exception_details: {
        type: Sequelize.JSON,
      },
      endpoint: {
        type: Sequelize.JSON,
      },
      retry_endpoint: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.ENUM(PoisonMessageState.getValues()),
        allowNull: false,
        defaultValue: PoisonMessageState.ENUM.PENDING
      },
      replayed_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        field: "created_at",
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: "deleted_at"
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("poison_message");
    await queryInterface.sequelize.query('DROP TYPE "enum_poison_message_state";');
  }
}; 