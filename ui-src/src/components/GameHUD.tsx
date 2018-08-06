import * as React from 'react';

import {Link} from 'react-router-dom';

import './GameHUD.css';

import LeaderBoard from './LeaderBoard';
import Chatbox from './Chatbox';
import store from '../store'

type GameHUDState = {
  collapsed: boolean
}

class GameHUD extends React.Component<any, GameHUDState> {

  private collapser: React.RefObject<HTMLDivElement> = React.createRef()

  constructor(props) {
    super(props)
    this.state = {
      collapsed: false
    }
  }

  public componentDidMount() {
    this.collapser.current!.addEventListener(
      'mousemove',
      this.mouseMoveListener
    )
  }

  public componentWillUnmount() {
    this.collapser.current!.removeEventListener(
      'mousemove',
      this.mouseMoveListener
    )
  }

  public render() {
    const collapsedClass = this.state.collapsed ? "collapsed" : ""
    return <div className={"game-hud " + collapsedClass}>
      <div className='banner'>
        <div className="collapser" onClick={this.onCollapse} ref={this.collapser}>
          <img src="/images/chevron-right.svg"/>
        </div>
        <div>
          <img src='/images/holochain_banner.png' className="banner-img" />
        </div>
      </div>
      <nav className="game-hud-nav">
        <Link to="/">&larr; Back to lobby</Link>
      </nav>
      <div>
        <span>Remaining Mines: {store.getState().currentGame!.matrix.getRemainingMines()}</span>
      </div>
      <div className="game-leaderboard">
        <LeaderBoard />
      </div>
      <div className="game-chat">
        <Chatbox/>
      </div>
    </div>
  }

  private onCollapse = (e) => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  private mouseMoveListener (e) {
    // NOTE: wrote this to prevent interference with mouse pan indicators,
    // then realized it won't work. So this does nothing.
    // e.stopPropagation()
  }
}

export default GameHUD;
