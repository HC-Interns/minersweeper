import * as React from 'react';
import './GameView.css';

import { connect } from 'react-redux';

import {
  fetchCurrentGames,
  fetchJSON,
  FETCH_ACTIONS_INTERVAL
} from '../common';
import store from '../store';

import Field from './Field';
import GameHUD from './GameHUD';
import GameOver from './GameOver';

type FieldProps = {
  currentGame: any
}

class GameView extends React.Component<any, { loading: boolean }> {

  private actionsInterval: any = null

  constructor(props) {
    super(props)
    this.state = { loading: true }
  }

  public componentWillMount() {
    const hash = this.props.match.params.hash
    if (hash) {
      const { allGames } = store.getState()
      const dispatchViewGame = () => store.dispatch({
        hash,
        type: 'VIEW_GAME',
      })
      if (!allGames.has(hash)) {
        this.setState({ loading: true })
        fetchCurrentGames(store.dispatch).then(() => {
          dispatchViewGame()
          this.forceUpdate()
          this.setState({ loading: false })
        })
      } else {
        dispatchViewGame()
      }
    }
  }

  public render() {
    const { currentGame } = store.getState()

    if (currentGame) {
      if (currentGame.gameOver === true) {
        const { matrix, gameHash } = currentGame
        return <div className="game-container">
          <Field gameHash={gameHash} matrix={matrix} />
          <GameHUD />
        </div>
      }
      else {
        const { matrix, gameHash } = currentGame
        return <div className="game-container">
          <Field gameHash={gameHash} matrix={matrix} actions={[]} />
          <GameHUD />
        </div>
      }
    } else {
      return this.state.loading ? <h1>loading...</h1> : <h1>Game not found...</h1>
    }
  }
}


const mapStateToProps = state => ({
  currentGame: state.currentGame
})

export default connect(mapStateToProps)(GameView);
