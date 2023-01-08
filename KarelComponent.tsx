import React from "react";
import { useState } from "react";
import { postProgram, preProgram } from "./karel";
import { getTestCases, program } from "./program";
import { Context, Direction, State, TestCase } from "./types";

export default function KarelComponent() {
  const context: Context = {
    boardHeight: 6,
    boardWidth: 6,
  };
  const testCases = getTestCases();

  if (!testCases) {
    throw new Error("test cases must exist");
  }

  const canonicalTestCase = testCases[0];

  if (!canonicalTestCase) {
    throw new Error("at least one test case must be provided");
  }

  const [states, setStates] = useState<State[]>([
    canonicalTestCase.initialState,
  ]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  console.log("Application state", states[currentIndex]);

  const [failedTestCases, setFailedTestCases] = useState<number[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClickRun = async () => {
    // Reset to initial state, if needed
    setStates([canonicalTestCase.initialState]);
    setFailedTestCases([]);

    // Run test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      if (!testCase) {
        throw new Error("test case must exist");
      }

      const fail = ()=>setFailedTestCases((prevFailedTestCases) =>
      prevFailedTestCases.concat(i)
    );
      const result = run(testCase.initialState, testCase.context);
      if (result.error) {
        fail();
        continue;
      }
      const finalState = result.states[result.states.length - 1];
      if (!finalState) {
        fail()
        continue
      }
      if (!statesEqual(testCase.goalState, finalState)) {
        fail()
        continue
      }
    }

    // Run "canonical" test case -- the one we actuall show the user
    let result = run(canonicalTestCase.initialState, context);

    if (result.error) {
      setErrorMessage(result.message);
      return
    }

    setStates(result.states);

    // Run queue
    for (let i = 0; i < result.states.length; i++) {
      await pause();
      const state = result.states[i];

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
      <Grid
        width={context.boardWidth}
        height={context.boardHeight}
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
        <TestCaseDisplay testCase={testCase} failed={failedTestCases.includes(i)}/>
      ))}
    </div>
  );
}

type TestCaseDisplayProps = {
  testCase: TestCase;
  failed: boolean
};

function TestCaseDisplay({ testCase, failed }: TestCaseDisplayProps) {
  return (
    <div style={{ display: "flex", border: `3px solid ${failed ? 'red' : 'black'}`, padding: 20 }}>
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

  type RunResult = { error: false, states: State[] } | { error: true, message: string };

const run = (initialState: State, context: Context): RunResult =>{
  preProgram(initialState, context);
    try {
      program();
    } catch (e) {
      let message = "Unknown error";
      if (e instanceof Error) {
        message = e.message;
      }
      return { error: true, message };
    }
    return { error: false, states: postProgram()};
}

const statesEqual = (a: State, b: State) => {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.direction === b.direction &&
    a.beepers.length === b.beepers.length &&
    a.beepers.every((beeper) => b.beepers.some((b) => b.x === beeper.x && b.y === beeper.y))
  );
};