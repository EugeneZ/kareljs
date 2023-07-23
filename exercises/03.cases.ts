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
        beepers: [{x: 1, y: 2}],
    }
  }]
}