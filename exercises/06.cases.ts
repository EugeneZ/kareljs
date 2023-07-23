import { TestCase } from "../types";

export default function getTestCases(): TestCase[] {
  return [
    {
      context: { boardHeight: 3, boardWidth: 3 },
      initialState: {
        x: 0,
        y: 2,
        direction: "east",
        beepers: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
      goalState: {
        x: 0,
        y: 1,
        direction: "west",
        beepers: [],
      },
    },
    {
      context: { boardHeight: 3, boardWidth: 6 },
      initialState: {
        x: 0,
        y: 1,
        direction: "west",
        beepers: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 5, y: 2 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 4, y: 1 },
          { x: 5, y: 1 },
        ],
      },
      goalState: {
        x: 5,
        y: 2,
        direction: "east",
        beepers: [],
      },
    },
  ];
}
