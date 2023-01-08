// TODO:
// 1. Test cases
// 5. paintCorner(color)
// 6. Walls
// 7. random(), random(p) 
//
// etc: beepersInBag(), noBeepersInBag() 

import { move, turnLeft } from "./karel"
import { TestCase } from "./types"

export function program() {
  move()
  move()
  move()
  turnLeft()
  move()
  move()
}


export function getTestCases(): TestCase[] {
  return [{
    context: { boardHeight: 6, boardWidth: 6},
    initialState: {
        x: 0,
        y: 5,
        direction: 'east',
        beepers: [{ x: 3, y: 3 }],
    },
    goalState: {
        x: 3,
        y: 3,
        direction: 'east',
        beepers: [],
    }
  },{
    context: { boardHeight: 9, boardWidth: 9},
    initialState: {
        x: 0,
        y: 8,
        direction: 'east',
        beepers: [{ x: 7, y: 2 }],
    },
    goalState: {
        x: 7,
        y: 2,
        direction: 'east',
        beepers: [],
    }
  }]
}