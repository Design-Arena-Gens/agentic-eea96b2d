"use client";

import { Tab } from "@headlessui/react";
import clsx from "classnames";
import { PlannerView } from "../lib/date-utils";

const views: { id: PlannerView; label: string }[] = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" }
];

type Props = {
  value: PlannerView;
  onChange: (value: PlannerView) => void;
};

export function ViewToggle({ value, onChange }: Props) {
  return (
    <Tab.Group
      selectedIndex={views.findIndex((view) => view.id === value)}
      onChange={(index) => onChange(views[index].id)}
    >
      <Tab.List className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-1">
        {views.map((view) => (
          <Tab
            key={view.id}
            className={({ selected }) =>
              clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                selected
                  ? "bg-brand-500 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800/80"
              )
            }
          >
            {view.label}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
}
