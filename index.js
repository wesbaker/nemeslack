require("dotenv").config();

const IncomingWebhook = require("@slack/client").IncomingWebhook;
const axios = require("axios");
const moment = require("moment");
const url = process.env.SLACK_WEBHOOK_URL || "";
const webhook = new IncomingWebhook(url);
const getAttachments = require("./lib/Play").getAttachments;

axios
  .get("https://nemestats.com/api/v2/PlayedGames/", {
    params: {
      gamingGroupId: process.env.GAMING_GROUP_ID,
      datePlayedFrom: moment().subtract(1, "days").format("YYYY-MM-DD"),
      datePlayedTo: moment().subtract(1, "days").format("YYYY-MM-DD")
    }
  })
  .then(({ data: { playedGames } }) => {
    playedGames.forEach(playData => {
      getAttachments(playData).then(attachments => {
        webhook.send({ attachments });
      });
    });
  })
  .catch(error => {
    console.error(error);
  });
