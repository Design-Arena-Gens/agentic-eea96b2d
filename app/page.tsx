"use client";

import {
  ArrowPathIcon,
  CalendarIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import clsx from "classnames";
import { addDays, format, parseISO, startOfDay, subDays, isSameDay } from "date-fns";
import { useState } from "react";
import useSWR from "swr";
import { ProgressWidget } from "../components/ProgressWidget";
import { TaskEditorModal } from "../components/TaskEditorModal";
import { TaskTimeline } from "../components/TaskTimeline";
import { ViewToggle } from "../components/ViewToggle";
import { getDatesForView, getRangeForView, PlannerView } from "../lib/date-utils";
import { expandRecurringTasks } from "../lib/recurrence";
import { useToastStore } from "../lib/stores/toast-store";
import { Task, TaskPayload } from "../lib/types";
import { taskSchema } from "../lib/validation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlannerPage() {
  const [view, setView] = useState<PlannerView>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const notify = useToastStore((state) => state.notify);

  const { start, end } = getRangeForView(view, referenceDate);
  const { data, isLoading, mutate } = useSWR<{ tasks: Task[] }>(
    `/api/tasks?view=${view}&date=${format(referenceDate, "yyyy-MM-dd")}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const tasks = data?.tasks ?? [];

  const occurrences = expandRecurringTasks(
    tasks,
    new Date(start),
    new Date(end)
  );

  const handleSubmitTask = async (payload: TaskPayload) => {
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    await mutate();
    setEditingTask(undefined);
  };

  const handleUpdate = async (
    taskId: number,
    updates: Partial<Task>
  ): Promise<void> => {
    const payload: Partial<TaskPayload> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined)
      payload.description = updates.description;
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
    if (updates.recurrence !== undefined)
      payload.recurrence = updates.recurrence;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.progress !== undefined) payload.progress = updates.progress;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.estimatedMinutes !== undefined)
      payload.estimatedMinutes = updates.estimatedMinutes;
    if (updates.checklist !== undefined) payload.checklist = updates.checklist;

    if (Object.keys(payload).length === 0) return;

    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await mutate();
  };

  const handleDelete = async (taskId: number) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    await mutate();
    notify({
      title: "Task removed",
      description: "The task has been deleted from your planner."
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const overdueTasks = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      parseISO(task.dueDate) < startOfDay(new Date())
  );

  const focusStreak = calculateFocusStreak(tasks);

  const days = getDatesForView(view, referenceDate);

  const navigate = (direction: "prev" | "next") => {
    const delta = direction === "next" ? 1 : -1;
    switch (view) {
      case "day":
        setReferenceDate((current) => addDays(current, delta));
        break;
      case "week":
        setReferenceDate((current) => addDays(current, delta * 7));
        break;
      case "month":
        setReferenceDate((current) => addDays(current, delta * 30));
        break;
      default:
        setReferenceDate((current) => addDays(current, delta));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
            <CalendarIcon className="h-4 w-4" />
            TaskFlow
          </span>
          <h1 className="mt-4 text-4xl font-bold text-white">
            Your command center for high-impact days.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Align your day, week, and month with smart scheduling, recurring tasks, and progress insights tailored for busy professionals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("prev")}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => setReferenceDate(new Date())}
              className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200 hover:bg-brand-500/20"
            >
              Today
            </button>
            <button
              onClick={() => navigate("next")}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setEditorOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add task
          </button>
        </div>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <ProgressWidget
          completed={completedTasks.length}
          total={totalTasks}
          focusStreak={focusStreak}
          overdue={overdueTasks.length}
        />
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Highlights
            </h2>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-200 hover:text-brand-100"
            >
              <ArrowPathIcon className={clsx("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Insight
              title="Focus tasks"
              value={`${tasks.filter((task) => task.priority === "urgent").length}`}
              description="Urgent priorities demanding your attention."
            />
            <Insight
              title="Recurring streak"
              value={`${tasks.filter((task) => task.recurrence !== "none").length}`}
              description="Keep habits alive with repeating tasks."
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <TaskTimeline
            view={view}
            referenceDate={referenceDate}
            days={days}
            tasks={occurrences}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={(task) => {
              setEditingTask(task);
              setEditorOpen(true);
            }}
          />
        )}
      </section>

      <TaskEditorModal
        open={editorOpen}
        initialTask={editingTask}
        onClose={() => {
          setEditorOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleSubmitTask}
      />
    </main>
  );
}

function Insight({
  title,
  value,
  description
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function calculateFocusStreak(tasks: Task[]): number {
  const today = startOfDay(new Date());
  let streak = 0;
  for (let index = 0; index < 30; index += 1) {
    const day = subDays(today, index);
    const hasCompleted = tasks.some((task) => {
      const due = startOfDay(parseISO(task.dueDate));
      return isSameDay(due, day) && task.status === "completed";
    });
    if (hasCompleted) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
