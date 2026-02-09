"use client";

import { Dialog, Transition } from "@headlessui/react";
import { formatISO } from "date-fns";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Task } from "../lib/types";
import { TaskFormData, taskSchema } from "../lib/validation";
import { useToastStore } from "../lib/stores/toast-store";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTask?: Task;
  onSubmit: (values: TaskFormData) => Promise<void>;
};

const defaultForm: TaskFormData = {
  title: "",
  description: "",
  dueDate: formatISO(new Date()),
  recurrence: "none",
  priority: "medium",
  progress: 0,
  status: "pending",
  estimatedMinutes: null,
  checklist: []
};

export function TaskEditorModal({ open, onClose, initialTask, onSubmit }: Props) {
  const notify = useToastStore((state) => state.notify);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<TaskFormData>(
    initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description ?? "",
          dueDate: initialTask.dueDate,
          recurrence: initialTask.recurrence,
          priority: initialTask.priority,
          progress: initialTask.progress,
          status: initialTask.status,
          estimatedMinutes: initialTask.estimatedMinutes ?? null,
          checklist: initialTask.checklist ?? []
        }
      : defaultForm
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      initialTask
        ? {
            title: initialTask.title,
            description: initialTask.description ?? "",
            dueDate: initialTask.dueDate,
            recurrence: initialTask.recurrence,
            priority: initialTask.priority,
            progress: initialTask.progress,
            status: initialTask.status,
            estimatedMinutes: initialTask.estimatedMinutes ?? null,
            checklist: initialTask.checklist ?? []
          }
        : { ...defaultForm, dueDate: formatISO(new Date()) }
    );
  }, [initialTask, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const validated = taskSchema.parse(form);
      await onSubmit(validated);
      onClose();
      notify({
        title: initialTask ? "Task updated" : "Task added",
        description: initialTask
          ? "Changes saved successfully."
          : "Task added to your planner."
      });
    } catch (error) {
      notify({
        title: "Invalid task details",
        description: "Please double-check required fields."
      });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const dueDateLocal = useMemo(() => {
    if (!form.dueDate) return "";
    const date = new Date(form.dueDate);
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  }, [form.dueDate]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-40">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-white">
                  {initialTask ? "Edit Task" : "Create Task"}
                </Dialog.Title>
                <form
                  className="mt-4 space-y-4"
                  onSubmit={handleSubmit}
                  autoComplete="off"
                >
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        setForm((state) => ({ ...state, title: event.target.value }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Description
                    </label>
                    <textarea
                      value={form.description ?? ""}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          description: event.target.value
                        }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Due date & time
                      </label>
                      <input
                        type="datetime-local"
                        value={dueDateLocal}
                        onChange={(event) =>
                          setForm((state) => ({
                            ...state,
                            dueDate: new Date(event.target.value).toISOString()
                          }))
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={(event) =>
                          setForm((state) => ({
                            ...state,
                            priority: event.target.value as TaskFormData["priority"]
                          }))
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Recurrence
                      </label>
                      <select
                        value={form.recurrence}
                        onChange={(event) =>
                          setForm((state) => ({
                            ...state,
                            recurrence: event.target.value as TaskFormData["recurrence"]
                          }))
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                      >
                        <option value="none">Does not repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Estimated focus (minutes)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.estimatedMinutes ?? ""}
                        onChange={(event) =>
                          setForm((state) => ({
                            ...state,
                            estimatedMinutes:
                              event.target.value === ""
                                ? null
                                : Number(event.target.value)
                          }))
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Progress
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={10}
                      value={form.progress}
                      onChange={(event) =>
                        setForm((state) => ({
                          ...state,
                          progress: Number(event.target.value)
                        }))
                      }
                      className="mt-2 w-full accent-brand-500"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Progress: <span className="font-semibold text-white">{form.progress}%</span>
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/80"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                      {initialTask ? "Update task" : "Create task"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
