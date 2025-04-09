const chalk = require("chalk");

exports.logger = {
    error(...args) {
        console.log(chalk.red(...args));
    },
    warn(...args) {
        console.log(chalk.yellow(...args));
    },
    info(...args) {
        console.log(chalk.cyan(...args));
    },
    success(...args) {
        console.log(chalk.green(...args));
    },
    break() {
        console.log("");
    },
};

exports.handle_error = (error) => {
    if (typeof error === "string") {
        this.logger.error(error);
        process.exit(1);
    }

    if (error instanceof Error) {
        this.logger.error(error.message);
        process.exit(1);
    }

    this.logger.error("Something went wrong. Please try again.");
    process.exit(1);
};