require("dotenv").config();

const { IncomingWebhook } = require("@slack/webhook");
const axios = require("axios");

const format = require("date-fns/format");
const subDays = require("date-fns/sub_days");
const getAttachments = require("./lib/Play").getAttachments;

const testRun = process.argv.includes("--test");
if (testRun) {
  if (typeof IncomingWebhook !== "function") {
    console.error("@slack/client was not loaded.");
  }
  if (typeof axios !== "function") {
    console.error("axios was not loaded.");
  }
  if (typeof format !== "function") {
    console.error("format was not loaded.");
  }
  if (typeof subDays !== "function") {
    console.error("subDays was not loaded.");
  }
  console.log("Debug: Nemeslack would post now.");
  process.exit(0);
}

const Raven = require("raven");
Raven.config(process.env.SENTRY_DSN);

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

module.exports = async (req, res) => {
  await axios
    .get("https://nemestats.com/api/v2/PlayedGames/", {
      params: {
        gamingGroupId: process.env.GAMING_GROUP_ID,
        datePlayedFrom: format(subDays(new Date(), 1), "YYYY-MM-DD"),
        datePlayedTo: format(subDays(new Date(), 1), "YYYY-MM-DD")
      }
    })
    .then(({ data: { playedGames } }) => {
      const promises = playedGames.map(playData => {
        return getAttachments(playData).then(attachments => {
          return webhook.send({ attachments }).catch(err => {
            Raven.captureException(err);
          });
        });
      });

      return Promise.all(promises).then(() =>
        res.end(`${playedGames.length} plays sent to Slack.`)
      );
    })
    .catch(err => {
      Raven.captureException(err);
      res.statusCode = 404;
      res.end(err.message);
    });
};
