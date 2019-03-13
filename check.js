require("dotenv").config();

const IncomingWebhook = require("@slack/client").IncomingWebhook;
const axios = require("axios");
const moment = require("moment");
const getAttachments = require("./lib/Play").getAttachments;

const testRun = process.argv.includes("--test");
if (testRun) {
  if (typeof IncomingWebhook !== "function") {
    console.error("@slack/client was not loaded.");
  }
  if (typeof axios !== "function") {
    console.error("axios was not loaded.");
  }
  if (typeof moment !== "function") {
    console.error("moment was not loaded.");
  }
  console.log("Debug: Nemeslack would post now.");
  process.exit(0);
}

const Raven = require("raven");
Raven.config(process.env.SENTRY_DSN);

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

module.exports = (req, res) => {
  axios
    .get("https://nemestats.com/api/v2/PlayedGames/", {
      params: {
        gamingGroupId: process.env.GAMING_GROUP_ID,
        datePlayedFrom: moment()
          .subtract(1, "days")
          .format("YYYY-MM-DD"),
        datePlayedTo: moment()
          .subtract(1, "days")
          .format("YYYY-MM-DD")
      }
    })
    .then(({ data: { playedGames } }) => {
      playedGames.forEach(playData => {
        getAttachments(playData).then(attachments => {
          webhook.send({ attachments }, err => {
            if (err) Raven.captureException(err);
          });
        });
      });
      res.end(`${playedGames.length} plays sent to Slack.`);
    })
    .catch(err => {
      Raven.captureException(err);
      res.statusCode = 404;
      res.end(err.message);
    });
};
