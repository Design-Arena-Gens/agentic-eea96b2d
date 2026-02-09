import { NextResponse } from "next/server";
import { deleteTask, listTasks, updateTask } from "../../../../lib/task-service";
import { taskUpdateSchema } from "../../../../lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const tasks = await listTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const json = await request.json();
    const parsed = taskUpdateSchema.parse(json);
    const updated = await updateTask(id, parsed);
    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Failed to update task", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  await deleteTask(id);
  return NextResponse.json({ success: true });
}
