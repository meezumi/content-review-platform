const { Queue } = require("bullmq");
require("dotenv").config();

const emailQueue = new Queue("email-queue", {
  connection: {
    host: process.env.REDIS_URL.split("//")[1].split(":")[0],
    port: process.env.REDIS_URL.split(":")[2],
  },
});

module.exports = emailQueue;
