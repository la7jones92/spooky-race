import React from "react";
import type { Task, TeamTask } from "../types";

type Props = {
  task: Task;                // template fields (title, description, points, hint, etc.)
  teamTask?: TeamTask;       // per-team state (status, order, pointsAwarded, etc.)
  disableActions?: boolean;  // for this test: keep all actions disabled
};

const badgeClass = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";

function StatusBadge({ status }: { status?: TeamTask["status"] }) {
  if (!status) return null;
  const map: Record<string, string> = {
    LOCKED: "border-gray-300 text-gray-600",
    UNLOCKED: "border-blue-300 text-blue-700",
    COMPLETED: "border-green-300 text-green-700",
    SKIPPED: "border-yellow-300 text-yellow-700",
  };
  return <span className={`${badgeClass} ${map[status] || "border-gray-300"}`}>{status}</span>;
}

export function TaskCard({ task, teamTask, disableActions }: Props) {
  const {
    title,
    description,
    detailedDescription,
    bonusPhotoDescription,
    points,
    bonusPoints,
    hint,
    hintPointsPenalty,
  } = task;

  const order = teamTask?.order;
  const status = teamTask?.status;
  const pointsAwarded = teamTask?.pointsAwarded ?? 0;
  const bonusAwarded = teamTask?.bonusAwarded ?? 0;

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {order ? <span className="opacity-60 mr-2">#{order}</span> : null}
            {title}
          </h2>
          <p className="text-sm opacity-80 mt-1">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {detailedDescription ? (
        <p className="text-sm mt-3">{detailedDescription}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border p-2">
          <div className="font-medium">Base Points</div>
          <div className="opacity-80">{points}</div>
        </div>
        <div className="rounded-lg border p-2">
          <div className="font-medium">Bonus Photo</div>
          <div className="opacity-80">+{bonusPoints}</div>
        </div>
        <div className="rounded-lg border p-2">
          <div className="font-medium">Hint Penalty</div>
          <div className="opacity-80">-{hintPointsPenalty}</div>
        </div>
        <div className="rounded-lg border p-2">
          <div className="font-medium">Your Score (so far)</div>
          <div className="opacity-80">
            {pointsAwarded + bonusAwarded}
            <span className="opacity-60"> pts</span>
          </div>
        </div>
      </div>

      {hint ? (
        <div className="mt-3 text-sm italic opacity-80">
          Hint available (−{hintPointsPenalty} pts): {hint}
        </div>
      ) : null}

      {bonusPhotoDescription ? (
        <div className="mt-2 text-sm opacity-80">
          Bonus photo: {bonusPhotoDescription} (+{bonusPoints} pts)
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="px-3 py-2 rounded-md border opacity-60 cursor-not-allowed"
          disabled={true || disableActions}
          aria-disabled="true"
          title="Disabled for test"
        >
          Submit Code
        </button>
        <button
          className="px-3 py-2 rounded-md border opacity-60 cursor-not-allowed"
          disabled={true || disableActions}
          aria-disabled="true"
          title="Disabled for test"
        >
          Use Hint
        </button>
        <button
          className="px-3 py-2 rounded-md border opacity-60 cursor-not-allowed"
          disabled={true || disableActions}
          aria-disabled="true"
          title="Disabled for test"
        >
          Skip Task
        </button>
        <button
          className="px-3 py-2 rounded-md border opacity-60 cursor-not-allowed"
          disabled={true || disableActions}
          aria-disabled="true"
          title="Disabled for test"
        >
          Upload Photo
        </button>
      </div>
    </div>
  );
}