export type TestCase = {
  context: Context
  initialState: State
  goalState: State
}

export type Direction = "north" | "east" | "south" | "west";

export type Beeper = {
  x: number;
  y: number;
};

export type Beepers = Array<Beeper>;

export type State = {
  x: number;
  y: number;
  direction: Direction;
  beepers: Beepers;
};

export type Context = {
  boardWidth: number;
  boardHeight: number;
}

export type RunResult =
  | { error: false; states: State[] }
  | { error: true; message: string };