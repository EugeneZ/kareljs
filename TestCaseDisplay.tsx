import React from "react";
import Grid from "./Grid";
import { RunResult, TestCase } from "./types";

type Props = {
  testCase: TestCase;
  result: RunResult | null | undefined;
};

export default function TestCaseDisplay({ testCase, result }: Props) {
  return (
    <div
      style={{
        display: "flex",
        border: `3px solid ${
          result ? (result.error ? "red" : "green") : "black"
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
