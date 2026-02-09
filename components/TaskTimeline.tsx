"use client";

import clsx from "classnames";
import {
  format,
  formatISO,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO
} from "date-fns";
import { useMemo } from "react";
import { PlannerView } from "../lib/date-utils";
import { GeneratedOccurrence } from "../lib/recurrence";
import { Task } from "../lib/types";
import { TaskCard } from "./TaskCard";

type Props = {
  view: PlannerView;
  referenceDate: Date;
  days: Date[];
  tasks: GeneratedOccurrence[];
  onUpdate: (taskId: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onEdit: (task: Task) => void;
};

export function TaskTimeline({
  view,
  referenceDate,
  days,
  tasks,
  onUpdate,
  onDelete,
  onEdit
}: Props) {
  const grouped = useMemo(() => {
    const buckets = new Map<string, GeneratedOccurrence[]>();
    tasks.forEach((task) => {
      const key = formatISO(parseISO(task.occurrenceDate), {
        representation: "date"
      });
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(task);
    });
    return buckets;
  }, [tasks]);

  if (view === "month") {
    const weeks: Date[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const key = formatISO(day, { representation: "date" });
                const dayTasks = grouped.get(key) ?? [];
                return (
                  <div
                    key={key}
                    className={clsx(
                      "min-h-[140px] rounded-2xl border border-slate-900/80 bg-slate-900/40 p-3 text-left transition",
                      isToday(day) && "border-brand-500/60",
                      !isSameMonth(day, referenceDate) && "opacity-40"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {format(day, "d")}
                      </span>
                      {dayTasks.length ? (
                        <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                          {dayTasks.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 space-y-2 overflow-y-auto text-xs scrollbar-thin">
                      {dayTasks.slice(0, 3).map((task) => (
                        <button
                          key={task.occurrenceId}
                          onClick={() => onEdit(task)}
                          className="w-full rounded-xl bg-slate-800/60 px-2 py-1 text-left text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          <div className="truncate font-semibold">{task.title}</div>
                          <div className="truncate text-[10px] text-slate-400">
                            {format(parseISO(task.occurrenceDate), "p")}
                          </div>
                        </button>
                      ))}
                      {dayTasks.length > 3 ? (
                        <p className="text-[10px] text-slate-400">
                          +{dayTasks.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "week") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => {
          const key = formatISO(day, { representation: "date" });
          const dayTasks = grouped.get(key) ?? [];
          return (
            <div
              key={key}
              className={clsx(
                "rounded-3xl border border-slate-800 bg-slate-950/60 p-4",
                isToday(day) && "border-brand-500/60 bg-slate-950/80"
              )}
            >
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {format(day, "EEE")}
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {format(day, "d MMM")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800/70 px-2 py-1 text-xs text-slate-300">
                  {dayTasks.length} tasks
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {dayTasks.length ? (
                  dayTasks.map((task) => (
                    <TaskCard
                      key={task.occurrenceId}
                      task={task}
                      occurrenceDate={task.occurrenceDate}
                      onEdit={() => onEdit(task)}
                      onUpdate={(updates) => onUpdate(task.id, updates)}
                      onDelete={() => onDelete(task.id)}
                    />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    No tasks scheduled. Add one to stay on track.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const dayKey = formatISO(referenceDate, { representation: "date" });
  const dayTasks = grouped.get(dayKey) ?? [];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {format(referenceDate, "EEEE")}
          </p>
          <h2 className="text-3xl font-bold text-white">
            {format(referenceDate, "d MMMM yyyy")}
          </h2>
        </div>
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
          {dayTasks.length} scheduled
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {dayTasks.length ? (
          dayTasks.map((task) => (
            <TaskCard
              key={task.occurrenceId}
              task={task}
              occurrenceDate={task.occurrenceDate}
              onEdit={() => onEdit(task)}
              onUpdate={(updates) => onUpdate(task.id, updates)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
            <p className="text-sm font-semibold text-white">
              You are all caught up! 🎉
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Add a new task to keep your productivity streak going.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
