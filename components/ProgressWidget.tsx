"use client";

import { CheckCircleIcon, ClockIcon, FireIcon } from "@heroicons/react/24/solid";

type Props = {
  completed: number;
  total: number;
  focusStreak: number;
  overdue: number;
};

export function ProgressWidget({
  completed,
  total,
  focusStreak,
  overdue
}: Props) {
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Weekly Progress
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{completionRate}%</p>
        </div>
        <div className="relative h-16 w-16">
          <svg viewBox="0 0 36 36" className="h-16 w-16">
            <path
              className="text-slate-700"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 1 1 0-31.831"
              strokeDasharray="100, 100"
            />
            <path
              className="text-brand-500"
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 1 1 0-31.831"
              strokeDasharray={`${completionRate}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-200">
            {completed}/{total}
          </span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
        <Metric
          icon={<CheckCircleIcon className="h-4 w-4 text-emerald-400" />}
          label="Completed"
          value={`${completed}`}
        />
        <Metric
          icon={<ClockIcon className="h-4 w-4 text-amber-400" />}
          label="Overdue"
          value={`${overdue}`}
        />
        <Metric
          icon={<FireIcon className="h-4 w-4 text-pink-400" />}
          label="Focus streak"
          value={`${focusStreak}d`}
        />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
