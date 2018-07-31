import * as React from 'react';
import {connect} from 'react-redux';

import {Action, ActionType, GameParams, MoveDefinition, XY} from '../../../minesweeper'

import './Cell.css';

import {Hash} from '../../../holochain';

import CellMatrix from '../CellMatrix';
import {fetchJSON} from '../common'
import store from '../store'

type CellProps = {
  columnIndex: number,
  gameHash: Hash,
  rowIndex: number,
  style: any,
}

class Cell extends React.Component<CellProps, {}> {

  public render() {
    const {matrix, gameHash} = store.getState().currentGame!
    const {style} = this.props
    const pos = this.getPos()
    const statusClass =
      matrix.isRevealed(pos) ? "revealed"
      : matrix.isFlagged(pos) ? "flagged"
      : ""
    return <div className={"Cell " + statusClass} style={style} onClick={ this.handleReveal } />
  }

  private getPos = () => {
    const {columnIndex, rowIndex} = this.props
    return {x: columnIndex, y: rowIndex}
  }

  private handleReveal = e => {
    const pos = this.getPos()
    store.dispatch({type: 'QUICK_REVEAL', coords: pos})
    this.forceUpdate()
    const payload: MoveDefinition = {
      gameHash: this.props.gameHash,
      action: {
        actionType: "reveal",
        position: pos,
        agentHash: 'TODO',
      }
    }
    fetchJSON('/fn/minersweeper/makeMove', payload).then(ok => {
      // TODO: show score if ok
    })
  }

}

export default Cell;
