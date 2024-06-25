const port = 8000;
const wsport = port + 1;
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const Wordle = require("./model.js");
const fs = require("fs").promises;
const { json } = require("express");

const wsPMap = new Map();
let playing = {};
const sessions = {};
let id = 1;
var words = ["words"]; // just in case!!
const scorColMap = {
  0: "not_seen",
  1: "seen",
  2: "matched_wrong",
  3: "matched_right",
};

/******************************************************************************
 * word routines
 ******************************************************************************/

async function loadWords() {
  try {
    const data = await fs.readFile("./words.5", "utf8");
    words = data.split("\n");
  } catch (err) {
    console.error("Error loading words: ", err);
  }
}

(async () => {
  await loadWords();

  function getKeyFromValue(map, v) {
    for (let [key, value] of map.entries()) {
      if (value === v) {
        return key;
      }
    }
    return null;
  }

  /******************************************************************************
   * middleware
   ******************************************************************************/

  app.use(express.json()); // support json encoded bodies
  app.use(express.urlencoded({ extended: true })); // support encoded bodies
  app.use(cookieParser()); // cookies
  // https://expressjs.com/en/starter/static-files.html
  // app.use(express.static('static-content'));

  /******************************************************************************
   * web sockets
   ******************************************************************************/
  let Game = new Wordle(words);
  const gameLength = 300;
  const gameState = {
    type: "server_gstate",
    endGame: 0,
    x: 0,
    title: "",
    content: "",
    keysActive: true,
    statRight: 0,
    statWrong: 0,
    currGameBoard: Array(6)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({ letter: "", colour: "not_seen" }))
      ),
    timer: gameLength,
    currColours: Object.fromEntries(
      Array.from({ length: 26 }, (_, i) => [String.fromCharCode(i + 65), 0])
    ),
    target: Game.getTarget(),
  };
  let timerID;

  function resetGameState() {
    gameState.endGame = 0;
    gameState.x = 0;
    gameState.title = "";
    gameState.content = "";
    gameState.keysActive = true;
    gameState.currGameBoard = Array(6)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({ letter: "", colour: "not_seen" }))
      );
    gameState.currColours = Object.fromEntries(
      Array.from({ length: 26 }, (_, i) => [String.fromCharCode(i + 65), 0])
    );
    gameState.target = Game.getTarget();
    gameState.timer = gameLength;
    playing = {};
  }

  function startGameTimer() {
    if (timerID) {
      clearInterval(timerID);
    }
    timerID = setInterval(() => {
      gameState.timer -= 1;
      Object.values(playing).forEach((webS) => {
        webS.send(JSON.stringify({ type: "timer", timer: gameState.timer }));
      });
      if (gameState.timer <= 0) {
        clearInterval(timerID);
        serverUpdateThings([], "times up");
        Object.values(playing).forEach((webS) => {
          webS.send(JSON.stringify(gameState));
        });
        Game.state = "lost";
      }
    }, 1000);
  }

  function serverUpdateThings(score = [], state = "") {
    score.forEach((scorChar, i) => {
      const { score: charScore, char } = scorChar;
      gameState.currColours[char] =
        gameState.currColours[char] < charScore
          ? charScore
          : gameState.currColours[char];
      gameState.currGameBoard[gameState.x][i].colour = scorColMap[charScore];
      gameState.currGameBoard[gameState.x][i].letter = char;
    });
    gameState.x += 1;
    if (state === "won" || state === "lost" || state === "times up") {
      clearInterval(timerID);
      gameState.title = `You ${state} !!!`;
      let allP = Object.keys(playing).join(" & ");
      if (state === "times up") {
        gameState.content = `Hi ${allP}, unfortunately you did not guess the correct word: ${gameState.target} in time. You loose nothing.`;
      } else {
        gameState.content =
          state === "won"
            ? `Hi ${allP}, congrats on correctly guessing the word ${gameState.target}. You win some love.`
            : `Hi ${allP}, you tried and you failed, the correct word is ${gameState.target}. You loose nothing.`;
      }
      gameState.keysActive = false;
      gameState.endGame = 1;
      if (state === "won") {
        gameState.statRight += 1;
      } else {
        gameState.statWrong += 1;
      }
    }
  }

  const WebSocketServer = require("ws").Server;
  const wss = new WebSocketServer({ port: wsport });

  wss.on("close", (code, data) => {
    const reason = data.toString();
    console.log(`WebSocketServer closed due to ${reason}.`);
  });

  wss.on("connection", (ws) => {
    console.log("New client has connected.");

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      let username;
      switch (data.type) {
        case "connection":
          username = data.username;
          wsPMap.set(ws, username);
          console.log(`${username} has connected.`);
          break;
        case "guess_success":
          const { score, state } = data;
          serverUpdateThings(score, state);
          Object.values(playing).forEach((webS) => {
            webS.send(JSON.stringify(gameState));
          });
          break;
        case "want_game":
          ws.send(JSON.stringify(gameState));
          break;
      }
    });

    ws.on("close", () => {
      delete playing[wsPMap.get(ws)];
      wsPMap.delete(ws);
      console.log("Client has disconnected.");
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error: ${error}`);
    });
  });

  /******************************************************************************
   * routes
   ******************************************************************************/

  app.get("/api/username/", function (req, res) {
    // first connect
    let sessionID = req.cookies["sessionID"];
    let username;
    if (sessionID && sessionID in sessions) {
      username = sessions[sessionID];
    } else {
      do {
        username = Game.makeUsername();
      } while (Array.from(wsPMap.values()).includes(username));
      sessionID = id;
      sessions[sessionID] = username;
      id += 1;
      res.cookie("sessionID", sessionID, { maxAge: 3600000 });
    }
    res.json({ username: username });
  });

  app.put("/api/username/:username/newgame", function (req, res) {
    // new game
    let uname = req.params.username;
    if (Game.getState() !== "play") {
      Game.reset();
      resetGameState();
      startGameTimer();
    }
    let ws = getKeyFromValue(wsPMap, uname);
    if (ws !== null) {
      playing[uname] = ws;
    } else {
      console.error("Player not found?");
      res.status(404);
    }
    res.end();
  });

  // Add another guess against the current secret word
  app.post("/api/username/:username/guess/:guess", function (req, res) {
    let guess = req.params.guess;
    const data = Game.makeGuess(guess);
    res.json(data);
  });

  app.listen(port, function () {
    console.log("Example app listening on port " + port);
  });
})();
