require("dotenv").config();

const IncomingWebhook = require("@slack/client").IncomingWebhook;
const axios = require("axios");
const parseXML = require("xml2js").parseString;
const xmldoc = require("xmldoc");
const moment = require("moment");

const url = process.env.SLACK_WEBHOOK_URL || "";
const webhook = new IncomingWebhook(url);

const getUrl = play =>
  `https://nemestats.com/PlayedGame/Details/${play.playedGameId}`;

const createPlayers = players => {
  // Check to make sure _someone_ scored points
  const points = players.some(
    player => player.pointsScored !== null && player.pointsScored !== 0
  );
  const names = players.map(player => {
    const prefix = player.gameRank === 1 ? ":trophy: " : "";
    const name = player.playerName.split(" ")[0];
    const score = points ? ` (${player.pointsScored})` : "";
    return prefix + name + score;
  });

  return { title: "Players", value: names.join(", "), short: true };
};

const getThumbnail = bggId => {
  return axios
    .get("https://www.boardgamegeek.com/xmlapi2/thing", {
      params: { id: bggId }
    })
    .then(response => {
      const document = new xmldoc.XmlDocument(response.data);
      return document.valueWithPath("item.thumbnail");
    })
    .catch(err => console.error(err));
};

const createAttachment = (play, thumbUrl) => {
  const date = moment(play.datePlayed).format("dddd, MMMM Do YYYY");
  return [
    {
      fallback: "Required plain-text summary of the attachment.",
      color: "#354458",
      title: play.gameDefinitionName,
      title_link: getUrl(play),
      text: `Played on ${date}`,
      fields: [createPlayers(play.playerGameResults)],
      thumb_url: thumbUrl
    }
  ];
};

axios
  .get("https://nemestats.com/api/v2/PlayedGames/", {
    params: {
      gamingGroupId: 13468,
      datePlayedFrom: moment().subtract(14, 'days').format('YYYY-MM-DD'),
      datePlayedTo: moment().subtract(1, 'days').format('YYYY-MM-DD')
    }
  })
  .then(({ data: { playedGames } }) => {
    playedGames.forEach(play => {
      getThumbnail(play.boardGameGeekGameDefinitionId).then(thumbUrl => {
        webhook.send({ attachments: createAttachment(play, thumbUrl) });
      });
    });
  })
  .catch(error => {
    console.error(error);
  });
