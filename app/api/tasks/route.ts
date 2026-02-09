import { NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { listTasks, createTask } from "../../../lib/task-service";
import { getRangeForView } from "../../../lib/date-utils";
import { taskSchema } from "../../../lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = (searchParams.get("view") ?? "week") as
    | "day"
    | "week"
    | "month";
  const referenceDate = searchParams.get("date")
    ? parseISO(searchParams.get("date")!)
    : new Date();

  const { start, end } = getRangeForView(view, referenceDate);
  const tasks = await listTasks(start, end);

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = taskSchema.parse(json);
    const created = await createTask(parsed);
    return NextResponse.json({ task: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 400 }
    );
  }
}
