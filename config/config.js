require("dotenv").config();

module.exports = {
    "local": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "seederStorage": "sequelize",
        "logging": console.log,
        "define": {
            "underscored": true,
        },
    },
    "test": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": "db-test",
        "host": process.env.DB_HOST,
        "dialect": "postgres",
        "seederStorage": "sequelize",
        "logging": false,
        "define": {
            "underscored": true,
        },
    },
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "port": process.env.DB_PORT,
        "dialect": "postgres",
        "seederStorage": "sequelize",
        "logging": false,
        "define": {
            "underscored": true,
        },
        "dialectOptions": {
            ssl: process.env.DB_CERTIFICATE ? {
                required: true,
                rejectUnauthorized: true,
                ca: process.env.DB_CERTIFICATE
            } : false 
        },
        "retry": {
            "match": [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            "name": 'query',
            "backoffBase": 1000,
            "backoffExponent": 1.5,
            "timeout": 60000,
            "max": Infinity
        }
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "port": process.env.DB_PORT,
        "dialect": "postgres",
        "seederStorage": "sequelize",
        "logging": false,
        "define": {
            "underscored": true,
        },
        "dialectOptions": {
            ssl: process.env.DB_CERTIFICATE ? {
                required: true,
                rejectUnauthorized: true,
                ca: process.env.DB_CERTIFICATE
            } : false // If DB_CERTIFICATE is not set, SSL is disabled
        },
        "retry": {
            "match": [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            "name": 'query',
            "backoffBase": 1000,
            "backoffExponent": 1.5,
            "timeout": 60000,
            "max": Infinity
        }
    }
};
