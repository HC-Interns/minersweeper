import { List } from 'immutable';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './Lobby.css';

import { Action, ActionType, GameBoard, GameParams, MoveDefinition, XY } from '../../../minesweeper'

import { connect } from 'react-redux';

import Jdenticon from './Jdenticon';

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
     this.state = {addClass: false}
     this.toggleModal = this.toggleModal.bind(this);
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

  public toggleModalState() {
    this.setState({addClass: !this.state.addClass});
  }

  public toggleModal() {
    this.toggleModalState();
    // console.log("this.state.addClass", this.state.addClass);
    if (!this.state.addClass) {
      document.body.classList.remove("turn-off");
      document.body.classList.add("modal-active");
    } else {
      document.body.classList.add("turn-off");
      document.body.classList.remove("modal-active");
    }
  }

  public renderCryptoIcons() {
    return this.cryptoIcons.map((icon) => {
      return (
        <p key={icon} className="coin"  />
        // <p key={icon} src={`/images/${icon}`} />
      );
    });
  }

  public componentWillUnmount() {
    clearInterval(this.updateLobbyInterval)
  }

  public render() {
    const allGames = this.props.allGames
    const modalClass = ["modal-container"];
    const modalDiv = (
      <div className="interstitial-modal-overlay">
        <div className="interstitial-modal">
          <div className="modal-container register-modal">
            <div className="modal-background">
              <div className="modal">
                <CreateGameForm onCreate={this.toggleModal}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

    return (
      <div>
        <div className="screen">
          <div className="Lobby">
            <div className="lobby-jumbotron">
              <h1 className="lobby-header">Welcome to Minersweeper</h1>
              <div className="lobby-register">
                <h4>Create a Game Below</h4>
                <button onClick={this.toggleModal}>Create Game</button>
              </div>
            </div>
            <div className="lobby-overlay">
              <GameList allGames={allGames}/>
           </div>
          </div>
          {this.renderCryptoIcons()}
        </div>
        { this.state.addClass ? modalDiv : null }
      </div>
    );
  }
}

const GameList = ({ allGames }) => {
  if (allGames) {
    return <div className="live-games">
      <h3>Live Games</h3>
      <table>
        <thead>
          <tr>
            <th data-field="game">Game Name</th>
            <th data-field="author">Author</th>
            <th data-field="author">Author Flag</th>
            <th data-field="mine">Mines</th>
            <th data-field="size">Size</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(allGames.toJS()).map(hash => {
              const game = allGames.get(hash)
              console.log("game in body", game)
              return <tr key={hash}>
                <td>
                  <Link to={`/game/${hash}`}>
                    {game.description}
                  </Link>
                </td>
                <td>
                  <span className="author-hash align-items">{game.creatorHash.substring(0,5)}</span>
                </td>
                <td><Jdenticon className="jdenticon" size={30} hash={game.creatorHash}/></td>
                <td>{game.mines.length}</td>
                <td>{game.size.x} x {game.size.y}</td>
              </tr>
            })
          }
        </tbody>
      </table>
    </div>
  } else {
    return <ul />
  }
}


const mapStateToProps = ({ allGames }) => ({
  allGames
})

export default connect(mapStateToProps)(Lobby);
