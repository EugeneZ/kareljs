import { TestCase } from "../types";

export default function getTestCases(): TestCase[] {
  return [{
    context: { boardHeight: 3, boardWidth: 3},
    initialState: {
        x: 0,
        y: 2,
        direction: 'east',
        beepers: [],
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
        beepers: [],
    },
    goalState: {
        x: 5,
        y: 2,
        direction: 'east',
        beepers: [],
    }
  }]
}