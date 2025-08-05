const { Worker } = require("bullmq");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
require("dotenv").config();

console.log("Worker starting...");

// Configure Nodemailer with SendGrid
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

const emailQueueConnection = {
  host: process.env.REDIS_URL.split("//")[1].split(":")[0],
  port: process.env.REDIS_URL.split(":")[2],
};

const emailProcessor = async (job) => {
  const { to, subject, html } = job.data;
  console.log(`Sending email to ${to} with subject: ${subject}`);

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}`, error);
    // BullMQ will automatically retry the job on failure, which is great.
    throw error;
  }
};

new Worker("email-queue", emailProcessor, { connection: emailQueueConnection });

console.log("Worker listening for email jobs...");
