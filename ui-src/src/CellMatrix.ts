
import { Map } from "immutable";

import { Hash } from '../../holochain';
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

const MASK_ADJACENT = 0b00001111
const MASK_REVEALED = 0b00010000
const MASK_FLAGGED  = 0b00100000
const MASK_MINE     = 0b01000000


export default class CellMatrix {
  public size: Size;

  private data: Uint8Array;
  private flags: Map<number, Hash>;

  constructor(board: GameBoard) {
    this.size = board.size;
    this.data = new Uint8Array(this.size.x * this.size.y);
    this.flags = Map<number, Hash>();

    board.mines.forEach(minePos => this.setMine(minePos));
    board.mines.forEach(minePos => {
      this.forEachNeighbor(minePos, (x, y) => {
        this.incrementAdjacentMineCount({x, y});
      });
    });
  }

  public takeAction(action: Action) {
    switch (action.actionType) {
      case "flag":
        // TODO: maybe don't reveal if it's actually a mine
        // (so the UI doesn't have to make that distinction)
        this.triggerReveal(action.position);
        this.flagCell(action.position, action.agentHash);
        break;
      case "reveal":
        this.triggerReveal(action.position);
        break;
      case "chat":
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
    if (this.isFlagged(pos)) {
      return this.flags.get(this.posToIndex(pos));
    } else {
      return null;
    }
  }

  public triggerReveal(pos: Pos): number {
    const visited = new Set<number>();
    const toVisit = Array<Pos>(pos);
    let nRevealed = 0;

    if (this.isFlagged(pos) || this.isRevealed(pos)) {
      return 0;
    }

    if (this.isMine(pos)) {
      this.setRevealed(pos)
      return 1;
    }

    while (toVisit.length > 0) {
      const c = toVisit.shift()!;

      if (visited.has(this.posToIndex(c))) {
        continue;
      }

      this.setRevealed(c);
      visited.add(this.posToIndex(c));
      nRevealed++;

      if (this.getAdjacentMines(c) === 0) {
        this.forEachNeighbor(c, (x, y) => {
          const n = { x, y };
          if (!visited.has(this.posToIndex(n))) {
            toVisit.push(n);
          }
        });
      }
    }
    return nRevealed;
  }

  public getAdjacentMines(pos: Pos): number {
    // return the first 4 bits as a number
    return this.getValue(pos) & MASK_ADJACENT;
  }

  public isRevealed(pos: Pos): boolean {
    return (this.getValue(pos) & MASK_REVEALED) > 0;
  }

  public isFlagged(pos: Pos): boolean {
    return (this.getValue(pos) & MASK_FLAGGED) > 0;
  }

  public isMine(pos: Pos): boolean {
    return (this.getValue(pos) & MASK_MINE) > 0;
  }

  public isInBounds(x: number, y: number): boolean {
    return (x >= 0 && y >= 0 && x < this.size.x && y < this.size.y);
  }

  private forEachNeighbor(pos: Pos, func: any) {
    [-1, 0, 1].forEach(dx => {
      [-1, 0, 1].forEach(dy => {
        if (dx !== 0 || dy !== 0) {
          const x = pos.x + dx;
          const y = pos.y + dy;
          if (this.isInBounds(x, y)) {
            func(x, y);
          }
        }
      });
    });
  }

  private posToIndex(pos: Pos): number {
    return this.size.x * pos.y + pos.x
  }

  private getValue(pos: Pos): number {
    return this.data[this.posToIndex(pos)];
  }

  private setValue(pos: Pos, value: number) {
    this.data[this.posToIndex(pos)] = value;
  }

  private incrementAdjacentMineCount(pos: Pos) {
    // NB: this can overflow!! use with caution
    this.data[this.posToIndex(pos)] += 1
  }

  private setRevealed(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | MASK_REVEALED);
  }

  private setFlagged(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | MASK_FLAGGED);
  }

  private setMine(pos: Pos) {
    this.setValue(pos, this.getValue(pos) | MASK_MINE);
  }

}
