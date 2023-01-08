import React from "react";
import { useState } from "react";
import { postProgram, preProgram } from "./karel";
import { getTestCases, program } from "./program";
import { Context, Direction, State, TestCase } from "./types";

type TestCaseResult = {
  testCase: TestCase;
  result: RunResult;
};

type RunResult = { run: false } | CompletedRunResult;
type CompletedRunResult =
  | { run: true; error: false; states: State[] }
  | { run: true; error: true; message: string };

export default function KarelComponent() {
  const [currentTestCaseIndex, setCurrentTestCaseIndex] = useState<number>(0);

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [testCases, setTestCases] = useState<TestCaseResult[]>(
    getInitialTestCases()
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTestCase = testCases[currentTestCaseIndex];

  if (!currentTestCase) {
    throw new Error("test case must exist");
  }

  const [states, setStates] = useState<State[]>([
    currentTestCase.testCase.initialState,
  ]);

  const handleClickRun = async () => {
    setTestCases(getInitialTestCases());

    const newTestCases: TestCaseResult[] = [];

    // Run test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]?.testCase;

      if (!testCase) {
        throw new Error("test case must exist");
      }

      const result = run(testCase.initialState, testCase.context);
      if (result.error) {
        newTestCases.push({ testCase, result });
        continue;
      }
      const finalState = result.states[result.states.length - 1];
      if (!finalState) {
        newTestCases.push({
          testCase,
          result: {
            run: true,
            error: true,
            message: "Karel didn't do anything. Program exits early?",
          },
        });
        continue;
      }
      if (!statesEqual(testCase.goalState, finalState)) {
        newTestCases.push({
          testCase,
          result: { run: true, error: true, message: "Did not meet goal." },
        });
        continue;
      }

      newTestCases.push({ testCase, result });
    }

    setTestCases(newTestCases);

    const result = newTestCases[newTestCases.length - 1];

    if (!result) {
      setErrorMessage("No test cases found");
      return;
    }

    if (!result.result.run) {
      setErrorMessage("Program did not run");
      return;
    }

    if (result.result.error) {
      setErrorMessage(result.result.message);
      return;
    }

    // Run queue
    for (let i = 0; i < result.result.states.length; i++) {
      await pause();
      const state = result.result.states[i];

      if (!state) {
        throw new Error("state must exist");
      }

      setStates((prevStates) => prevStates.concat(state));
      setCurrentIndex(i);
    }
  };

  const handleBack = () => {
    if (currentIndex === -1) {
      setCurrentIndex(states.length - 2);
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleForward = () => {
    setCurrentIndex((i) => i + 1);
  };

  const stateToUse =
    currentIndex >= 0 && currentIndex < states.length
      ? states[currentIndex]
      : states[states.length - 1];

  if (!stateToUse) {
    throw new Error("initial state not found");
  }

  return (
    <div>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <Grid
        width={currentTestCase.testCase.context.boardWidth}
        height={currentTestCase.testCase.context.boardHeight}
        state={stateToUse}
      />
      <button onClick={handleBack} disabled={currentIndex === 0}>
        &lt;
      </button>
      <RunButton onClick={handleClickRun} />
      <button
        onClick={handleForward}
        disabled={currentIndex === states.length - 1 || currentIndex === -1}
      >
        &gt;
      </button>

      {testCases.map((testCase, i) => (
        <TestCaseDisplay
          testCase={testCase.testCase}
          result={testCase.result}
        />
      ))}
    </div>
  );
}

type TestCaseDisplayProps = {
  testCase: TestCase;
  result: RunResult;
};

function TestCaseDisplay({ testCase, result }: TestCaseDisplayProps) {
  return (
    <div
      style={{
        display: "flex",
        border: `3px solid ${
          result.run ? (result.error ? "red" : "green") : "black"
        }`,
        padding: 20,
      }}
    >
      <div style={{ zoom: "0.2" }}>
        <Grid
          width={testCase.context.boardWidth}
          height={testCase.context.boardHeight}
          state={testCase.initialState}
        />
      </div>

      <div>---&gt;</div>

      <div style={{ zoom: "0.2" }}>
        <Grid
          width={testCase.context.boardWidth}
          height={testCase.context.boardHeight}
          state={testCase.goalState}
        />
      </div>
    </div>
  );
}

type GridProps = {
  width: number;
  height: number;
  state: State;
};

function Grid({ width, height, state }: GridProps) {
  return (
    <>
      {Array(height)
        .fill(null)
        .map((_, y) => (
          <GridRow>
            {Array(width)
              .fill(null)
              .map((_, x) => (
                <Cell
                  beepers={
                    state.beepers.filter(
                      (beeper) => beeper.x === x && beeper.y === y
                    ).length
                  }
                  karelDirection={
                    state.x === x && state.y === y ? state.direction : null
                  }
                  wallTop={false}
                  wallRight={false}
                  wallBottom={false}
                  wallLeft={false}
                />
              ))}
          </GridRow>
        ))}
    </>
  );
}

type GridRowProps = {
  children: React.ReactNode;
};

const GridRow: React.FC<GridRowProps> = ({ children }) => {
  return <div style={{ display: "flex" }}>{children}</div>;
};

type CellProps = {
  karelDirection: Direction | null;
  beepers: number;
  wallTop: boolean;
  wallRight: boolean;
  wallBottom: boolean;
  wallLeft: boolean;
};

function Cell({
  karelDirection,
  beepers,
  wallTop,
  wallRight,
  wallBottom,
  wallLeft,
}: CellProps) {
  const wallStyle = "2px solid #333";
  const gridStyle = "1px dotted #999";

  const borderTop = wallTop ? wallStyle : gridStyle;
  const borderRight = wallRight ? wallStyle : gridStyle;
  const borderBottom = wallBottom ? wallStyle : gridStyle;
  const borderLeft = wallLeft ? wallStyle : gridStyle;

  return (
    <div
      style={{
        height: 100,
        width: 100,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        position: "relative",
      }}
    >
      {karelDirection && <Karel direction={karelDirection} />}
      {beepers > 0 && <Beepers count={beepers} />}
    </div>
  );
}

type KarelProps = {
  direction: Direction;
};

function Karel({ direction }: KarelProps) {
  const rotation =
    direction === "north"
      ? 180
      : direction === "east"
      ? 270
      : direction === "south"
      ? 0
      : direction === "west"
      ? 90
      : -1;

  if (rotation === -1) {
    throw new Error("invalid direction!");
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          rotate: "" + rotation + "deg",
          fontSize: 40,
        }}
      >
        🤖
      </div>
    </div>
  );
}

type BeepersProps = {
  count: number;
};
function Beepers({ count }: BeepersProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        backgroundColor: "aliceblue",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        fontSize: "x-large",
      }}
    >
      {count}
    </div>
  );
}

type RunButtonProps = {
  onClick: () => void;
};

function RunButton({ onClick }: RunButtonProps) {
  return <button onClick={onClick}>Run</button>;
}

const pause = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 250);
  });

const run = (initialState: State, context: Context): CompletedRunResult => {
  preProgram(initialState, context);
  try {
    program();
  } catch (e) {
    let message = "Unknown error";
    if (e instanceof Error) {
      message = e.message;
    }
    return { run: true, error: true, message };
  }
  return { run: true, error: false, states: postProgram() };
};

const statesEqual = (a: State, b: State) => {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.direction === b.direction &&
    a.beepers.length === b.beepers.length &&
    a.beepers.every((beeper) =>
      b.beepers.some((b) => b.x === beeper.x && b.y === beeper.y)
    )
  );
};

const getInitialTestCases = (): TestCaseResult[] =>
  getTestCases().map((testCase) => ({ testCase, result: { run: false } }));
