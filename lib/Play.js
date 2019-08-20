const format = require("date-fns/format");
const parseISO = require("date-fns/parseISO");
const xmldoc = require("xmldoc");
const axios = require("axios");

const getUrl = gameId => `https://nemestats.com/PlayedGame/Details/${gameId}`;

const createPlayers = players => {
  // Check to make sure _someone_ scored points
  const points = players.some(
    player => player.pointsScored !== null && player.pointsScored !== 0
  );
  const names = players.map(player => {
    const prefix = player.gameRank === 1 ? ":trophy: " : "";
    const name = player.playerName.split(" ")[0];
    const score = player.pointsScored || 0;
    const suffix = points ? ` (${score})` : "";
    return prefix + name + suffix;
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
  const date = format(parseISO(play.datePlayed), "EEEE, MMMM do yyyy");
  return [
    {
      fallback: `${play.gameDefinitionName} was played on ${date}.`,
      color: "#354458",
      title: play.gameDefinitionName,
      title_link: getUrl(play.playedGameId),
      text: `Played on ${date}`,
      fields: [createPlayers(play.playerGameResults)],
      thumb_url: thumbUrl
    }
  ];
};

const getAttachments = playData => {
  return getThumbnail(playData.boardGameGeekGameDefinitionId).then(thumbUrl => {
    return createAttachment(playData, thumbUrl);
  });
};

module.exports = {
  getAttachments,
  createAttachment,
  getThumbnail,
  createPlayers,
  getUrl
};
