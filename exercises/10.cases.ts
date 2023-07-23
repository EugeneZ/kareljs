import { TestCase } from "../types";

export default function getTestCases(): TestCase[] {
  return [{
    context: { boardHeight: 6, boardWidth: 6},
    initialState: {
        x: 0,
        y: 5,
        direction: 'east',
        beepers: [{ x: 2, y: 5 }, { x: 4, y: 5 }],
    },
    goalState: {
        x: 5,
        y: 5,
        direction: 'east',
        beepers: [{ x: 2, y: 0 },{ x: 2, y: 1 },{ x: 2, y: 2 },{ x: 2, y: 3 },{ x: 2, y: 4 },{ x: 2, y: 5 }, { x: 4, y: 0 },{ x: 4, y: 1 },{ x: 4, y: 2 },{ x: 4, y: 3 },{ x: 4, y: 4 },{ x: 4, y: 5 }],
    }
  }]
}