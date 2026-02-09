"use client";

import {
  CalendarDaysIcon,
  CheckIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import clsx from "classnames";
import { format, isPast } from "date-fns";
import { useState } from "react";
import { Task } from "../lib/types";

type Props = {
  task: Task;
  occurrenceDate?: string;
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit: () => void;
};

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-emerald-500/20 text-emerald-200 border-emerald-500/50",
  medium: "bg-sky-500/20 text-sky-200 border-sky-500/50",
  high: "bg-amber-500/20 text-amber-200 border-amber-500/50",
  urgent: "bg-rose-500/20 text-rose-200 border-rose-500/50"
};

export function TaskCard({
  task,
  occurrenceDate,
  onUpdate,
  onDelete,
  onEdit
}: Props) {
  const [saving, setSaving] = useState(false);

  const due = occurrenceDate ? new Date(occurrenceDate) : new Date(task.dueDate);
  const overdue = task.status !== "completed" && isPast(due);

  const handleComplete = async () => {
    setSaving(true);
    await onUpdate({
      status: "completed",
      progress: 100
    });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{task.title}</p>
          {task.description ? (
            <p className="mt-1 text-xs text-slate-300">{task.description}</p>
          ) : null}
        </div>
        <span
          className={clsx(
            "rounded-full border px-3 py-0.5 text-xs font-semibold",
            priorityStyles[task.priority]
          )}
        >
          {task.priority}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDaysIcon className="h-4 w-4" />
          {format(due, "EEE, MMM d • HH:mm")}
        </span>
        <span>{task.recurrence !== "none" ? `Repeats ${task.recurrence}` : ""}</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={task.progress}
          onChange={async (event) => {
            const value = Number(event.target.value);
            setSaving(true);
            await onUpdate({
              progress: value,
              status: value === 100 ? "completed" : task.status
            });
            setSaving(false);
          }}
          className="w-full accent-brand-500"
        />
        <span className="w-10 text-right text-xs text-slate-300">
          {task.progress}%
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "rounded-full px-2 py-0.5",
              overdue
                ? "bg-rose-500/20 text-rose-200"
                : task.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-slate-800 text-slate-300"
            )}
          >
            {overdue
              ? "Overdue"
              : task.status === "completed"
                ? "Completed"
                : "In progress"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            disabled={saving || task.status === "completed"}
            className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            <CheckIcon className="h-4 w-4" />
            Complete
          </button>
          <button
            onClick={onEdit}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            type="button"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
