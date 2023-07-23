import React from "react";
import { Direction, State } from "./types";

type GridProps = {
  width: number;
  height: number;
  state: State;
};

export default function Grid({ width, height, state }: GridProps) {
  return (
    <>
      {Array(height)
        .fill(null)
        .map((_, y) => (
          <GridRow key={y}>
            {Array(width)
              .fill(null)
              .map((_, x) => (
                <Cell
                  key={x}
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
