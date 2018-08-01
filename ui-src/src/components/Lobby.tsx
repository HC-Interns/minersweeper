import { List } from 'immutable';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './Lobby.css';

import { Action, ActionType, GameBoard, GameParams, MoveDefinition, XY } from '../../../minesweeper'

import { connect } from 'react-redux';

import { fetchJSON, FETCH_LOBBY_INTERVAL } from '../common';

import CreateGameForm from './CreateGameForm'

// interface LobbyProps {
//   games: List<GameParams>
// }

class Lobby extends React.Component<any, any> {
  public cryptoIcons = ["btc", "eth", "xmr", "ltc", "doge", "drgn", "bcc", "kmd", "dbc", "elix", "mkr", "powr", "xvg", "zec", "huc", "tel", "pot", "pay", "ox", "nxs", "nmc", "lrc"];

  private updateLobbyInterval: any = null

  constructor(props) {
    super(props);
    this.state = { addClass: false }
    this.registerGame = this.registerGame.bind(this);
  }

  public componentWillMount() {
    const updateLobby = () => {
      fetchJSON('/fn/minersweeper/getCurrentGames')
        .then(games => this.props.dispatch({
          games,
          type: 'FETCH_CURRENT_GAMES'
        }))
    }
    updateLobby()
    this.updateLobbyInterval = setInterval(
      updateLobby, FETCH_LOBBY_INTERVAL
    )
  }

  public toggleModal() {
    this.setState({ addClass: !this.state.addClass });
  }

  public registerGame() {
    this.toggleModal();
    const modalClass = ["modal-container"];
    if (this.state.addClass) {
      modalClass.push("register-modal");
      document.body.classList.add("modal-active");
      console.log("modal is active!");

    }
  }

  public renderCryptoIcons() {
    return this.cryptoIcons.map((icon) => {
      return (
        <p key={icon} className="coin"  />
        // <p key={icon} />
      );
    });
  }

  public componentWillUnmount() {
    clearInterval(this.updateLobbyInterval)
  }

  public render() {
    const modalClass = ["modal-container"];
    const allGames = this.props.allGames

    if (this.state.addClass) {
      return (
        <div className="interstitial-modal-overlay">
          <div className="interstitial-modal">
            <div className={modalClass.join(" ")}>
              <div className="modal-background">
                <div className="modal">
                  <CreateGameForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className="screen">
          <div className="Lobby">
            <div className="lobby-jumbotron">
              <h1 className="lobby-header">Welcome to Minersweeper</h1>
            </div>
            <div className="lobby-register">
              <h4>Create a Game Below</h4>
              <button onClick={this.registerGame}>Create Game</button>
              <GameList allGames={allGames} />
            </div>
          </div>
          {this.renderCryptoIcons()}
        </div>
      </div>
    );
  }
}

const GameList = ({ allGames }) => {
  if (allGames) {
    return <div>
      <table>
        <h3>Live_Games</h3>
        <tr>
          <td>Game_Name</td>
          <td>Mines</td>
          <td>Size</td>
        </tr>
        {
          Object.keys(allGames.toJS()).map(hash => {
            const game = allGames.get(hash)
            return <tr key={hash}>
              <Link to={`/game/${hash}`}>
                <td>{game.description}</td>
              </Link>
              <td>{game.mines.length}</td>
              <td>{game.size.x} x {game.size.y}</td>
              {console.log("game in body", game)}
            </tr>

          })
        } </table></div>
  } else {
    return <ul />
  }
}

const mapStateToProps = ({ allGames }) => ({
  allGames
})

export default connect(mapStateToProps)(Lobby);
