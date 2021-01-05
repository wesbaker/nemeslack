import "dotenv/config";
import axios from "axios";
import format from "date-fns/format";
import subDays from "date-fns/subDays";
import Raven from "raven";
import { IncomingWebhook } from "@slack/webhook";
import { NowRequest, NowResponse } from "@vercel/node";
import { getAttachments, Play } from "../lib/Play";

Raven.config(process.env.SENTRY_DSN);

const url = process.env.SLACK_WEBHOOK_URL || "";
const webhook = new IncomingWebhook(url);

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  await axios
    .get("https://nemestats.com/api/v2/PlayedGames/", {
      params: {
        gamingGroupId: process.env.GAMING_GROUP_ID,
        datePlayedFrom: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        datePlayedTo: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      },
    })
    .then(({ data: { playedGames } }) => {
      const promises = playedGames.map((playData: Play) => {
        return getAttachments(playData).then((attachments) => {
          return webhook.send({ attachments }).catch((err) => {
            Raven.captureException(err);
          });
        });
      });

      return Promise.all(promises).then(() =>
        res.end(`${playedGames.length} plays sent to Slack.`)
      );
    })
    .catch((err) => {
      Raven.captureException(err);
      res.statusCode = 404;
      res.end(err.message);
    });
};
