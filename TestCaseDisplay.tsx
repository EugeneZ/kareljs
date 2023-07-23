import React from "react";
import Grid from "./Grid";
import { RunResult, TestCase } from "./types";

type Props = {
  testCase: TestCase;
  result: RunResult | null | undefined;
  pass: boolean | null;
};

export default function TestCaseDisplay({ testCase, result, pass }: Props) {
  return (
    <div style={{
    border: `3px solid ${
      result ? (result.error || pass === false ? "red" : "green") : "black"
    }`,
    padding: 20,}}>
      {result?.error && (
        <div style={{ color: "red" }}>{result.message}</div>
      )}
    <div
      style={{
        display: "flex",
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
    </div>
  );
}
