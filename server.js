require("dotenv").config();
global.argv = process.argv.slice(2);
global.port = global.argv[0] || process.env.APP_PORT;
if (!global.port) {
  console.log("port is not defined. argv = ", global.argv);
  process.exit(128);
}

const express = require("express");
const cors = require("cors");
const { checkConnection } = require("./config/db-connection");
const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Routes declaration
app.use("/", require("./routes"));

app.use(function (req, res) {
  res.status(404).json({ error: "Unable to find the requested resource!" });
});

process.on("uncaughtException", function (err) {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled rejection at:", p, "reason:", reason);
});

if (process.env.NODE_ENV !== "test") {
  checkConnection()
    .then(() => {
      app.listen(global.port, () => {
        const NODE_ENV = process.env.NODE_ENV;
        console.log(`${NODE_ENV} Server is listening on port ${global.port}`);
      });
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
      console.error('Cancelling app server launch');
    });
}

module.exports = app;
