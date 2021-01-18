import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import xmldoc from "xmldoc";
import axios from "axios";
import { MessageAttachment } from "@slack/types";

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

interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

export const partyTime = (): string => {
  console.log("uncovered!");
  const value = 30 + 57;
  console.log(value);
  return getUrl(value);
};

export const getUrl = (gameId: number): string =>
  `https://nemestats.com/PlayedGame/Details/${gameId}`;

export const createPlayers = (players: Player[]): SlackField => {
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

export const getThumbnail = (bggId: number): Promise<string | undefined> => {
  return axios
    .get("https://www.boardgamegeek.com/xmlapi2/thing", {
      params: { id: bggId },
    })
    .then((response) => {
      const document = new xmldoc.XmlDocument(response.data);
      return document.valueWithPath("item.thumbnail") || undefined;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
};

export const createAttachment = (
  play: Play,
  thumbUrl: string | undefined
): MessageAttachment[] => {
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

export const getAttachments = async (
  playData: Play
): Promise<MessageAttachment[]> => {
  const thumbUrl = await getThumbnail(playData.boardGameGeekGameDefinitionId);
  return createAttachment(playData, thumbUrl);
};
