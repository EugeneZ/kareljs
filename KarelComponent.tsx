import confetti from "canvas-confetti";
import React, { ButtonHTMLAttributes } from "react";
import { useState } from "react";
import Grid from "./Grid";
import { runProgram, statesEqual } from "./karel";
import exercises from "./exercises";
import TestCaseDisplay from "./TestCaseDisplay";
import { RunResult, State, TestCase } from "./types";
import useLocalStorageState from "./useLocalStorageState";

type TestCaseResult = {
  testCase: TestCase;
  result: RunResult | null;
  pass: boolean | null;
};

export default function KarelComponent() {
  const [currentExercise, setCurrentExercise] = useLocalStorageState<
    keyof typeof exercises
  >("currentExercise", "01: Hello world!");

  const { program, cases } = exercises[currentExercise];

  const getInitialTestCases = (): TestCaseResult[] =>
    cases().map((testCase) => ({ testCase, result: null, pass: null }));

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
    setErrorMessage(null);
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
        newTestCases.push({ testCase, result, pass: false });
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
          pass: false,
        });
        continue;
      }

      newTestCases.push({
        testCase,
        result,
        pass: statesEqual(testCase.goalState, finalState),
      });
    }

    const result = newTestCases[newTestCases.length - 1];

    if (!result) {
      setErrorMessage("No test cases found");
      setTestCaseResults(newTestCases);
      return;
    }

    if (!result.result) {
      setErrorMessage("Program did not run");
      setTestCaseResults(newTestCases);
      return;
    }

    if (result.result.error) {
      setErrorMessage(result.result.message);
      setTestCaseResults(newTestCases);
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
      setCurrentIndex((i) => i + 1);
    }

    if (
      newTestCases.some((testCase) => !testCase.pass || testCase.result?.error)
    ) {
      setErrorMessage("Did not pass all tests...");
    } else {
      confetti({
        particleCount: 250,
        spread: 180,
      });
    }
    setTestCaseResults(newTestCases);
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
      <ExerciseSelector
        currentExercise={currentExercise}
        onChangeExercise={(e) => {
          setCurrentIndex(0)
          setTestCaseResults(exercises[e].cases().map((testCase) => ({ testCase, result: null, pass: null })))
          setCurrentExercise(e);
          setErrorMessage(null);
          setStates([exercises[e].cases()[0]!.initialState]);
        }}
      />
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
        {testCaseResults.map((testCase,i) => (
          <TestCaseDisplay
            key={i}
            testCase={testCase.testCase}
            result={testCase.result}
            pass={testCase.pass}
          />
        ))}
      </div>
      <div>
        <h3>Command List</h3>
        <ul>
          <li>move()</li>
          <li>turnLeft()</li>
          <li>putBeeper()</li>
          <li>pickBeeper()</li>
          <li>frontIsClear()</li>
          <li>frontIsBlocked()</li>
          <li>leftIsBlocked()</li>
          <li>rightIsBlocked()</li>
          <li>backIsBlocked()</li>
          <li>facingNorth()</li>
          <li>facingEast()</li>
          <li>facingSouth()</li>
          <li>facingWest()</li>
          <li>beepersPresent()</li>
        </ul>
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

function ExerciseSelector({
  currentExercise,
  onChangeExercise,
}: {
  currentExercise: string;
  onChangeExercise: (exercise: keyof typeof exercises) => void;
}) {
  return (
    <select
      value={currentExercise}
      onChange={(e) => {
        onChangeExercise(e.target.value as keyof typeof exercises);
      }}
    >
      {Object.keys(exercises).map((key) => (
        <option key={key} value={key}>{key}</option>
      ))}
    </select>
  );
}

const pause = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
