import { List } from 'immutable';
import * as React from 'react';
import {Link} from 'react-router-dom';
import './Lobby.css';

import {Action, ActionType, GameBoard, GameParams, MoveDefinition, XY} from '../../../minesweeper'

import {connect} from 'react-redux';

import {fetchJSON} from '../common';

import CreateGameForm from './CreateGameForm'

// interface LobbyProps {
//   games: List<GameParams>
// }

class Lobby extends React.Component<any, {}> {

  public componentWillMount() {
    setInterval(
      () => {
        fetchJSON('/fn/minersweeper/getCurrentGames')
          .then(games => this.props.dispatch({
            games,
            type: 'FETCH_CURRENT_GAMES'
          }))
      },
      5000
     )
  }

  public render() {
    const allGames = this.props.allGames
    return (
      <div className="Lobby">
        <CreateGameForm/>
        <GameList allGames={allGames}/>
      </div>
    );
  }
}

const GameList = ({allGames}) => {
  if (allGames) {
    return <ul> {
      Object.keys(allGames.toJS()).map(hash => {
        const game = allGames.get(hash)
        return <li key={hash}>
          <Link to={`/game/${hash}`}>
            {game.description}
          </Link>
        </li>
      })
    } </ul>
  } else {
    return <ul/>
  }
}

const mapStateToProps = ({allGames}) => ({
  allGames
})

export default connect(mapStateToProps)(Lobby);
