import React, { ButtonHTMLAttributes } from "react";
import { useState } from "react";
import Grid from "./Grid";
import { runProgram, statesEqual } from "./karel";
import { getTestCases, program } from "./program";
import TestCaseDisplay from "./TestCaseDisplay";
import { RunResult, State, TestCase } from "./types";

type TestCaseResult = {
  testCase: TestCase;
  result: RunResult | null;
};

export default function KarelComponent() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>(
    getInitialTestCases()
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTestCase = testCaseResults[0];

  if (!currentTestCase) {
    throw new Error("There are no test cases in the provided file");
  }

  const [states, setStates] = useState<State[]>([
    currentTestCase.testCase.initialState,
  ]);

  const handleClickRun = async () => {
    setTestCaseResults(getInitialTestCases());

    const newTestCases: TestCaseResult[] = [];

    // Run test cases
    for (let i = 0; i < testCaseResults.length; i++) {
      const testCase = testCaseResults[i]?.testCase;

      if (!testCase) {
        throw new Error("test case must exist");
      }

      const result = runProgram(
        program,
        testCase.initialState,
        testCase.context
      );
      if (result.error) {
        newTestCases.push({ testCase, result });
        continue;
      }
      const finalState = result.states[result.states.length - 1];
      if (!finalState) {
        newTestCases.push({
          testCase,
          result: {
            error: true,
            message: "Karel didn't do anything. Program exits early?",
          },
        });
        continue;
      }
      if (!statesEqual(testCase.goalState, finalState)) {
        newTestCases.push({
          testCase,
          result: { error: true, message: "Did not meet goal." },
        });
        continue;
      }

      newTestCases.push({ testCase, result });
    }

    setTestCaseResults(newTestCases);

    const result = newTestCases[newTestCases.length - 1];

    if (!result) {
      setErrorMessage("No test cases found");
      return;
    }

    if (!result.result) {
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
      <div style={{ marginTop: "1em" }}>
        <Button onClick={handleBack} disabled={currentIndex === 0}>
          &lt;
        </Button>
        <Button
          onClick={handleForward}
          disabled={currentIndex === states.length - 1 || currentIndex === -1}
        >
          &gt;
        </Button>
        <Button onClick={handleClickRun} style={{ marginLeft: "0.5em" }}>
          Run Program
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginTop: "1em",
        }}
      >
        {testCaseResults.map((testCase) => (
          <TestCaseDisplay
            testCase={testCase.testCase}
            result={testCase.result}
          />
        ))}
      </div>
    </div>
  );
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{ padding: "1em", fontSize: "x-large", ...props.style }}
    />
  );
}

const pause = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 250);
  });

const getInitialTestCases = (): TestCaseResult[] =>
  getTestCases().map((testCase) => ({ testCase, result: null }));
