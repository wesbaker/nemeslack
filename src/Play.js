// @flow

const moment = require("moment");
const xmldoc = require("xmldoc");
const axios = require("axios");

const getUrl = (gameId: number) =>
  `https://nemestats.com/PlayedGame/Details/${gameId}`;

const createPlayers = (players: Array<Object>) => {
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

const getThumbnail = (bggId: number) => {
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

const createAttachment = (play: Object, thumbUrl: string) => {
  const date = moment(play.datePlayed).format("dddd, MMMM Do YYYY");
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

const getAttachments = (playData: Object) => {
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