
import { Map } from "immutable";

import {Hash} from '../../holochain';
import {
  Action,
  ActionType,
  GameBoard,
  GameParams,
  Pos,
  Size
} from '../../minesweeper';

export enum CellStatus {
  Concealed,
  Flagged,
  Revealed,
}


export default class CellMatrix {
  public size: Size;

  private data: Uint8Array;
  private flags: Map<number, Hash>;

  constructor(board: GameBoard) {
    this.size = board.size;
    this.data = new Uint8Array(this.size.x*this.size.y);
    this.flags = Map<number, Hash>()

    board.mines.forEach(minePos => {
      this.setMine(minePos);
      this.forEachNeighbor(minePos, (x, y) => {
        this.incrementAdjacentMineCount({x, y});
      });
    });
  }

  public takeAction(action: Action) {
    switch(action.actionType) {
      case "flag":
        this.flagCell(action.position, action.agentHash);
      case "reveal": // flags fall through to also trigger a reveal
        this.triggerReveal(action.position);
        break;
      default:
        break;
    }
  }

  public flagCell(pos: Pos, agentHash: Hash) {
    this.flags = this.flags.set(this.posToIndex(pos), agentHash);
    this.setFlagged(pos);
  }

  public getFlag(pos: Pos): Hash | null {
    if(this.isFlagged(pos)) {
      return this.flags.get(this.posToIndex(pos));
    } else {
      return null;
    }
  }

  public triggerReveal(pos: Pos): number {
    const visited = new Set<number>();
    const toVisit = Array<Pos>(pos);
    let nRevealed = 0;

    if(this.isFlagged(pos) || this.isRevealed(pos)) {
      return 0;
    }

    if(this.isMine(pos)) {
      this.setRevealed(pos)
      return 1;
    }

    while(toVisit.length > 0) {
      const c = toVisit.shift()!;

      if(visited.has(this.posToIndex(c))) {
        continue;
      }

      this.setRevealed(c);
      visited.add(this.posToIndex(c));
      nRevealed++;

      if(this.getAdjacentMines(c) === 0) {
        this.forEachNeighbor(c, (x, y) => {
          const n = {x,y};
          if(!visited.has(this.posToIndex(n))) {
            toVisit.push(n);
          }
        });
      }
    }
    return nRevealed;
  }

  public getAdjacentMines(pos: Pos): number {
    // return the first 4 bits as a number
    return this.getValue(pos) & 0b00001111;
  }

  public isRevealed(pos: Pos): boolean {
    return (this.getValue(pos) & 0b01000000) > 0;
  }

  public isFlagged(pos: Pos): boolean {
    return (this.getValue(pos) & 0b00100000) > 0;
  }

  public isMine(pos: Pos): boolean {
    return (this.getValue(pos) & 0b00010000) > 0;
  }

  private isInBounds(x: number, y: number): boolean {
    return (x>=0 && y>=0 && x<this.size.x && y < this.size.y);
  }

  private forEachNeighbor(pos: Pos, func: any) {
    [-1,0,1].forEach(dx => {
      [-1,0,1].forEach(dy => {
        if(dx !== 0 || dy !== 0) {
          const x = pos.x + dx;
          const y = pos.y + dy;
          if(this.isInBounds(x, y)) {
            func(x, y);
          }
        }
      });
    });
  }

  private posToIndex(pos: Pos) {
    return this.size.x*pos.x + pos.y
  }

  private xyToIndex(x: number, y: number) {
    return this.size.x*x + y;
  }

  private getValue(pos: Pos): number {
    return this.data[this.posToIndex(pos)];
  }

  private setValue(pos: Pos, value: number) {
    this.data[this.size.x*pos.x + pos.y] = value;
  }

  private incrementAdjacentMineCount(pos: Pos) {
    this.setValue(pos, this.getValue(pos)+1);
  }

  private setRevealed(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | 0b01000000);
  }

  private setFlagged(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | 0b00100000);
  }

  private setMine(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | 0b00010000);
  }

}
