import React from "react";
import { api_getUsername, api_guess, api_newgame } from "./api";

const scorColMap = {
  0: "not_seen",
  1: "seen",
  2: "matched_wrong",
  3: "matched_right",
};

class Icon extends React.Component {
  render() {
    const { iconSource, iconName, currUI } = this.props;
    return <span className={`${iconSource} ${currUI}`}>{iconName}</span>;
  }
}

class NavLink extends React.Component {
  render() {
    const { navName, navClick, navText, currUI } = this.props;
    let link;
    if (navName === "ui_home") {
      link = (
        <a name={navName} onClick={navClick} className={currUI}>
          {navText}
        </a>
      );
    } else {
      link = (
        <a name={navName} onClick={navClick}>
          <Icon
            iconSource="material-symbols-outlined"
            iconName={navText}
            currUI={currUI}
          />
        </a>
      );
    }
    return link;
  }
}

class Align extends React.Component {
  render() {
    const { uiHandler, alignClass, uiId } = this.props;
    let align;
    if (alignClass === "alignleft") {
      align = <span className={alignClass}></span>;
    } else if (alignClass === "aligncenter") {
      align = (
        <span className={alignClass}>
          <NavLink
            navName="ui_home"
            navClick={uiHandler}
            navText="309DLE"
            currUI={uiId}
          />
        </span>
      );
    } else if (alignClass === "alignright") {
      align = (
        <span className={alignClass}>
          <NavLink
            navName="ui_username"
            navClick={uiHandler}
            navText="person"
            currUI={uiId}
          />
          <NavLink
            navName="ui_play"
            navClick={uiHandler}
            navText="play_circle"
            currUI={uiId}
          />
          <NavLink
            navName="ui_stats"
            navClick={uiHandler}
            navText="leaderboard"
            currUI={uiId}
          />
          <NavLink
            navName="ui_instructions"
            navClick={uiHandler}
            navText="help"
            currUI={uiId}
          />
        </span>
      );
    }
    return align;
  }
}

class GameCell extends React.Component {
  render() {
    const { cellNum, cL } = this.props;
    return <td className={`col${cellNum} ${cL.colour}`}>{cL.letter}</td>;
  }
}

class GameRow extends React.Component {
  render() {
    const { rowNum, cGBR } = this.props;
    let cells = [];
    for (let i = 0; i < cGBR.length; i++) {
      cells.push(<GameCell key={i} cellNum={i} cL={cGBR[i]} />);
    }
    return <tr className={`row${rowNum}`}>{cells}</tr>;
  }
}

class GameBoard extends React.Component {
  render() {
    const { cGB } = this.props;
    let rows = [];
    for (let i = 0; i < cGB.length; i++) {
      rows.push(<GameRow key={i} rowNum={i} cGBR={cGB[i]} />);
    }
    return (
      <table className="letterbox">
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

class PlayButton extends React.Component {
  render() {
    const { bid, nGH, kA } = this.props;
    if (!kA)
      return (
        <button id={bid} onClick={nGH}>
          NEW GAME
        </button>
      );
  }
}

class KeyBoardRow extends React.Component {
  render() {
    const { letters, kPH, cC } = this.props;
    let keys = [];
    for (let i = 0; i < letters.length; i++) {
      let letter = letters[i];
      let colour = scorColMap[cC[letter]];
      keys.push(
        <td key={i} className={colour} onClick={kPH}>
          {letter}
        </td>
      );
    }
    return <tr>{keys}</tr>;
  }
}

class KeyBoard extends React.Component {
  render() {
    const { kPH, cC } = this.props;
    let row1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    let row2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    let row3 = ["DEL", "Z", "X", "C", "V", "B", "N", "M", "ENTER"];

    return (
      <div>
        <table className="keyboardrow">
          <tbody>
            <KeyBoardRow letters={row1} kPH={kPH} cC={cC} />
          </tbody>
        </table>
        <table className="keyboardrow">
          <tbody>
            <KeyBoardRow letters={row2} kPH={kPH} cC={cC} />
          </tbody>
        </table>
        <table className="keyboardrow">
          <tbody>
            <KeyBoardRow letters={row3} kPH={kPH} cC={cC} />
          </tbody>
        </table>
      </div>
    );
  }
}

class UIDiv extends React.Component {
  render() {
    const { uiId } = this.props;
    let ui;
    if (uiId === "ui_home") {
      ui = (
        <div className="ui_top" id={uiId}>
          <div className="textblock">
            Multi-Player
            <br />
            <br />
            Play the classic game collaboratively with others, press 'NEW GAME'
            to join.
          </div>
        </div>
      );
    } else if (uiId === "ui_username") {
      const uname = this.props.uname;
      ui = (
        <div className="ui_top" id={uiId}>
          <h2>
            username: <span id="username">{uname}</span>
          </h2>
        </div>
      );
    } else if (uiId === "ui_play") {
      const { cGB, kPH, nGH, kA, cC, t } = this.props;
      ui = (
        <div className="ui_top" id={uiId}>
          <Timer timer={t} />
          <center>
            <GameBoard cGB={cGB} />
          </center>
          <br />
          <br />
          <center>
            <KeyBoard kPH={kPH} cC={cC} />
          </center>
          <br />
          <br />
          <center>
            <PlayButton bid="play_newgame_button" nGH={nGH} kA={kA} />
          </center>
        </div>
      );
    } else if (uiId === "ui_stats") {
      const { sR, sW } = this.props;
      ui = (
        <div className="ui_top" id={uiId}>
          <center>
            <Icon
              iconSource="material-symbols-outlined"
              iconName="check_circle"
            />
            {sR} &nbsp;
            <Icon iconSource="material-symbols-outlined" iconName="help" />0
            &nbsp;
            <Icon iconSource="material-symbols-outlined" iconName="cancel" />
            {sW}
          </center>
        </div>
      );
    } else if (uiId === "ui_instructions") {
      ui = (
        <div className="ui_top" id={uiId}>
          <center>
            <h1>How to play?</h1>
          </center>
          <div className="textblock">
            <h2>classic game mode: </h2>
            <p>
              Press the 'NEW GAME' button to join the game with others, and
              collectively guess the word in 6 tries.
              <br />
              <br />
              Only valid five-letter words can be submitted.
              <br />
              <br />
              After each guess, the color of the letters will change to indicate
              how good the guess was!
              <br />
            </p>
            <hr />
            <h2>letter indication example: </h2>
            <p>The letter E is in the correct position.</p>
            <table className="example_table">
              <tbody>
                <ExampleRow word="HELLO" colours={[1, 3, 1, 1, 1]} />
              </tbody>
            </table>
            <p>The letter A is in the word, but in an incorrect position.</p>
            <table className="example_table">
              <tbody>
                <ExampleRow word="ABOUT" colours={[2, 1, 1, 1, 1]} />
              </tbody>
            </table>
            <p>The letter C and E are not in the word.</p>
            <table className="example_table">
              <tbody>
                <ExampleRow word="SAUCE" colours={[3, 2, 3, 1, 1]} />
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return ui;
  }
}

class ExampleRow extends React.Component {
  render() {
    const { word, colours } = this.props;
    const letters = word.split("");
    let row = [];
    for (let i = 0; i < letters.length; i++) {
      row.push(
        <td key={i} className={scorColMap[colours[i]]}>
          {letters[i]}
        </td>
      );
    }
    return <tr className="example_row">{row}</tr>;
  }
}

class Header extends React.Component {
  render() {
    const { uiHandler, uiId } = this.props;
    return (
      <header>
        <nav id="ui_nav">
          <Align alignClass="alignleft" uiHandler={uiHandler} uiId={uiId} />
          <Align alignClass="aligncenter" uiHandler={uiHandler} uiId={uiId} />
          <Align alignClass="alignright" uiHandler={uiHandler} uiId={uiId} />
        </nav>
      </header>
    );
  }
}

class EndGamePop extends React.Component {
  render() {
    const { tit, cont, closePop } = this.props;
    return (
      <div className="modal" id="end_popup">
        <button className="close" onClick={closePop}>
          &times;
        </button>
        <h3>{tit}</h3>
        <div className="modal-content">
          <p>{cont}</p>
        </div>
      </div>
    );
  }
}

class EndGameMini extends React.Component {
  render() {
    const { tit, expandPop } = this.props;
    return (
      <button id="end_minimized" onClick={expandPop}>
        {tit}
      </button>
    );
  }
}

class ErrorPop extends React.Component {
  render() {
    const { errMessage } = this.props;
    return (
      <div className="modal" id="error_popup">
        <h3>Error:</h3>
        <div className="modal-content">
          <p>{errMessage}</p>
        </div>
      </div>
    );
  }
}

class Timer extends React.Component {
  render() {
    const { timer } = this.props;
    return (
      <center>
        <br />
        <h3>Time's up in: {timer} seconds</h3>
        <br />
      </center>
    );
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUI: "ui_home",
      username: "",
      currGameBoard: Array(6)
        .fill(null)
        .map(() => Array(5).fill({ letter: "", colour: "not_seen" })),
      currColours: Object.fromEntries(
        Array.from({ length: 26 }, (_, i) => [String.fromCharCode(i + 65), 0])
      ),
      x: 0,
      y: 0,
      keysActive: false,
      title: "",
      content: "",
      endGame: 0,
      showErr: false,
      statRight: 0,
      statWrong: 0,
      timer: "x",
    };
    this.updateThings = this.updateThings.bind(this);
    this.updateFromServer = this.updateFromServer.bind(this);
    this.ws = null;
  }

  async newGameHandler() {
    const uname = this.state.username;
    try {
      await api_newgame(uname);
    } catch (error) {
      console.error("Error in newGame using api_newgame: ", error);
    }

    this.ws.send(JSON.stringify({ type: "want_game" }));
    this.setState({ keysActive: true, y: 0 });
  }
  closePop() {
    this.setState({ endGame: 2 });
  }
  expandPop() {
    this.setState({ endGame: 1 });
  }

  updateFromServer(data) {
    const {
      endGame,
      x,
      title,
      content,
      currGameBoard,
      currColours,
      keysActive,
      statRight,
      statWrong,
      timer,
    } = data;
    this.setState({
      endGame: endGame,
      x: x,
      y: 0,
      title: title,
      content: content,
      currGameBoard: currGameBoard,
      currColours: currColours,
      keysActive: keysActive,
      statRight: statRight,
      statWrong: statWrong,
      timer: timer,
    });
  }

  updateThings(key) {
    this.setState((prevState) => {
      let { x, y, statRight, statWrong, title, content, keysActive, endGame } =
        prevState;
      let ncurrColours = { ...prevState.currColours };
      let newBoard = prevState.currGameBoard.map((row) =>
        row.map((cell) => ({ ...cell }))
      );
      if (key === "DEL") {
        if (y > 0) {
          y -= 1;
          newBoard[x][y] = { letter: "", colour: "not_seen" };
        }
      } else if (key === "ENTER") {
        // assume guess was success
      } else {
        if (y < 5) {
          newBoard[x][y].letter = key;
          y += 1;
        }
      }
      return {
        currColours: ncurrColours,
        currGameBoard: newBoard,
        x: x,
        y: y,
        statRight: statRight,
        statWrong: statWrong,
        keysActive: keysActive,
        endGame: endGame,
        title: title,
        content: content,
      };
    });
  }

  async keyPressHandler(e) {
    const key = e.currentTarget.textContent;
    let { x, currGameBoard, keysActive, username } = this.state;
    if (!keysActive) return;
    if (key !== "ENTER") {
      this.updateThings(key);
      return;
    }
    // when ENTER is clicked
    const gues = currGameBoard[x].map((cell) => cell.letter).join("");
    try {
      const { success, error, state, score } = await api_guess(username, gues);
      if (success) {
        this.ws.send(
          JSON.stringify({ type: "guess_success", score: score, state: state })
        );
      } else {
        this.setState({ showErr: error });
        setTimeout(() => {
          this.setState({ showErr: false });
        }, 2000);
      }
    } catch (err) {
      console.error("Error in keyPressHandler ENTER api_guess: ", err);
    }
  }

  uiHandler(e) {
    const ui = e.currentTarget.name;
    this.setState({ currentUI: ui });
  }

  render() {
    const {
      endGame,
      showErr,
      currentUI,
      username,
      currGameBoard,
      currColours,
      keysActive,
      statRight,
      statWrong,
      title,
      content,
      timer,
    } = this.state;
    return (
      <div>
        <Header uiId={currentUI} uiHandler={(e) => this.uiHandler(e)} />

        <UIDiv
          uiId={currentUI}
          uname={username}
          cGB={currGameBoard}
          cC={currColours}
          kA={keysActive}
          sR={statRight}
          sW={statWrong}
          t={timer}
          kPH={(e) => this.keyPressHandler(e)}
          nGH={() => this.newGameHandler()}
        />

        {endGame === 1 && (
          <EndGamePop
            tit={title}
            cont={content}
            closePop={() => this.closePop()}
          />
        )}
        {endGame === 2 && (
          <EndGameMini tit={title} expandPop={() => this.expandPop()} />
        )}
        {showErr && <ErrorPop errMessage={showErr} />}
      </div>
    );
  }

  async componentDidMount() {
    try {
      const uname = await api_getUsername();
      this.setState({ username: uname });

      this.ws = new WebSocket("ws://localhost:8001");

      this.ws.onopen = () => {
        console.log("WebSocket connected to WebSocketServer.");
        this.ws.send(JSON.stringify({ type: "connection", username: uname }));
      };

      this.ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
          case "timer":
            this.setState({ timer: data.timer });
            break;
          case "server_gstate":
            this.updateFromServer(data);
            break;
        }
      };
      this.ws.onclose = () => {
        console.log("WebSocket disconnected from WebSocketServer.");
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error", error);
      };
    } catch (error) {
      console.error("Error in componentDidMount ", error);
    }
  }
  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
export { Main };
