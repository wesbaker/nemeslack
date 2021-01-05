import * as Play from "../Play";
import { cloneDeep } from "lodash";
import { rest } from "msw";
import { setupServer } from "msw/node";

const players: Play.Player[] = [
  { playerName: "Luke Skywalker", gameRank: 1, pointsScored: 10 },
  { playerName: "Darth Vader", gameRank: 2, pointsScored: 8 },
  { playerName: "R2-D2", gameRank: 3, pointsScored: 7 },
  { playerName: "Jar-Jar Binks", gameRank: 4, pointsScored: 0 },
];

const play: Play.Play = {
  gameDefinitionName: "Star Wars: A New Hope",
  playedGameId: 1,
  datePlayed: "1977-05-25",
  boardGameGeekGameDefinitionId: 187645,
  playerGameResults: players,
};

const thumbUrl =
  "https://images-na.ssl-images-amazon.com/images/M/MV5BYzQ2OTk4N2QtOGQwNy00MmI3LWEwNmEtOTk0OTY3NDk2MGJkL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_UX182_CR0,0,182,268_AL_.jpg";

const attachments = [
  {
    fallback: "Star Wars: A New Hope was played on Wednesday, May 25th 1977.",
    color: "#354458",
    title: "Star Wars: A New Hope",
    title_link: "https://nemestats.com/PlayedGame/Details/1",
    text: "Played on Wednesday, May 25th 1977",
    fields: [
      {
        title: "Players",
        value: ":trophy: Luke (10), Darth (8), R2-D2 (7), Jar-Jar (0)",
        short: true,
      },
    ],
    thumb_url: thumbUrl,
  },
];

const server = setupServer(
  rest.get("https://www.boardgamegeek.com/xmlapi2/thing", (req, res, ctx) => {
    const id = req.url.searchParams.get("id");

    if (id === "654321") {
      return res(
        ctx.xml(`
<items>
  <item>
    <title>Title</title>
  </item>
</items>
        `)
      );
    } else if (id !== "0") {
      return res(
        ctx.xml(`
<items>
  <item>
    <thumbnail>${thumbUrl}</thumbnail>
  </item>
</items>
      `)
      );
    }

    return res(ctx.status(400));
  })
);

describe("Play", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  describe("getUrl", () => {
    test("returns the correct URL", () => {
      expect(Play.getUrl(1)).toBe("https://nemestats.com/PlayedGame/Details/1");
    });
  });

  describe("createPlayers", () => {
    test("returns normal players", () => {
      expect(Play.createPlayers(players)).toEqual({
        title: "Players",
        value: ":trophy: Luke (10), Darth (8), R2-D2 (7), Jar-Jar (0)",
        short: true,
      });
    });

    test("returns tied players", () => {
      let testPlayers = cloneDeep(players);
      testPlayers[1]["gameRank"] = 1;
      testPlayers[1]["pointsScored"] = 10;
      expect(Play.createPlayers(testPlayers)).toEqual({
        title: "Players",
        value:
          ":trophy: Luke (10), :trophy: Darth (10), R2-D2 (7), Jar-Jar (0)",
        short: true,
      });
    });

    test("returns no scores when players have none", () => {
      const testPlayers = cloneDeep(players).map((player) => {
        player.pointsScored = null;
        return player;
      });
      expect(Play.createPlayers(testPlayers)).toEqual({
        title: "Players",
        value: ":trophy: Luke, Darth, R2-D2, Jar-Jar",
        short: true,
      });
    });

    test("returns 0 for a null score when at least one player has a score", () => {
      let testPlayers = cloneDeep(players);
      testPlayers[2]["pointsScored"] = null;
      testPlayers[3]["pointsScored"] = null;
      expect(Play.createPlayers(testPlayers)).toEqual({
        title: "Players",
        value: ":trophy: Luke (10), Darth (8), R2-D2 (0), Jar-Jar (0)",
        short: true,
      });
    });

    const cooperativePlayers = (win: boolean) =>
      cloneDeep(players).map((player) => {
        player.pointsScored = null;
        player.gameRank = win ? 1 : 2;
        return player;
      });

    test("trophies for all for a cooperative win", () => {
      expect(Play.createPlayers(cooperativePlayers(true))).toEqual({
        title: "Players",
        value:
          ":trophy: Luke, :trophy: Darth, :trophy: R2-D2, :trophy: Jar-Jar",
        short: true,
      });
    });

    test("no trophies for a cooperative loss", () => {
      expect(Play.createPlayers(cooperativePlayers(false))).toEqual({
        title: "Players",
        value: "Luke, Darth, R2-D2, Jar-Jar",
        short: true,
      });
    });
  });

  describe("getThumbnail", () => {
    test("returns a valid thumb URL for a known game", async () => {
      const url = await Play.getThumbnail(1);
      expect(url).toBe(thumbUrl);
    });

    test("returns an error for an invalid URL", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      await Play.getThumbnail(0);
      expect(console.error).toHaveBeenCalled();
    });

    test("returns blank string if no thumbnail value exists", async () => {
      const url = await Play.getThumbnail(654321);
      expect(url).toBe("");
    });
  });

  describe("createAttachment", () => {
    test("creates expected attachments array", () => {
      expect(Play.createAttachment(play, thumbUrl)).toEqual(attachments);
    });
  });

  describe("getAttachments", () => {
    test("returns full attachments array", async () => {
      const result = await Play.getAttachments(play);
      expect(result).toEqual(attachments);
    });
  });
});
