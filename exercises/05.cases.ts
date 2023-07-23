import { TestCase } from "../types";

export default function getTestCases(): TestCase[] {
  return [{
    context: { boardHeight: 3, boardWidth: 3},
    initialState: {
        x: 0,
        y: 2,
        direction: 'east',
        beepers: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}],
    },
    goalState: {
        x: 2,
        y: 2,
        direction: 'east',
        beepers: [],
    }
  },{
    context: { boardHeight: 3, boardWidth: 6 },
    initialState: {
        x: 0,
        y: 2,
        direction: 'east',
        beepers: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}],
    },
    goalState: {
        x: 5,
        y: 2,
        direction: 'east',
        beepers: [],
    }
  }]
}