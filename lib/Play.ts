import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import xmldoc from "xmldoc";
import axios from "axios";

export interface Player {
  pointsScored: number | null;
  gameRank: number;
  playerName: string;
}

export interface Play {
  boardGameGeekGameDefinitionId: number;
  gameDefinitionName: string;
  playedGameId: number;
  playerGameResults: Player[];
  datePlayed: string;
}

export const getUrl = (gameId: number): string =>
  `https://nemestats.com/PlayedGame/Details/${gameId}`;

export const createPlayers = (players: Player[]) => {
  // Check to make sure _someone_ scored points
  const points = players.some(
    (player) => player.pointsScored !== null && player.pointsScored !== 0
  );
  const names = players.map((player) => {
    const prefix = player.gameRank === 1 ? ":trophy: " : "";
    const name = player.playerName.split(" ")[0];
    const score = player.pointsScored || 0;
    const suffix = points ? ` (${score})` : "";
    return prefix + name + suffix;
  });

  return { title: "Players", value: names.join(", "), short: true };
};

export const getThumbnail = (bggId: number): Promise<string | void> => {
  return axios
    .get("https://www.boardgamegeek.com/xmlapi2/thing", {
      params: { id: bggId },
    })
    .then((response) => {
      const document = new xmldoc.XmlDocument(response.data);
      return document.valueWithPath("item.thumbnail") || "";
    })
    .catch((err) => console.error(err));
};

export const createAttachment = (
  play: Play,
  thumbUrl: string | void
): object[] => {
  const date = format(parseISO(play.datePlayed), "EEEE, MMMM do yyyy");
  return [
    {
      fallback: `${play.gameDefinitionName} was played on ${date}.`,
      color: "#354458",
      title: play.gameDefinitionName,
      title_link: getUrl(play.playedGameId),
      text: `Played on ${date}`,
      fields: [createPlayers(play.playerGameResults)],
      thumb_url: thumbUrl,
    },
  ];
};

export const getAttachments = (playData: Play) => {
  return getThumbnail(playData.boardGameGeekGameDefinitionId).then(
    (thumbUrl) => {
      return createAttachment(playData, thumbUrl);
    }
  );
};
