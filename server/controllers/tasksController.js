import { query } from "../config/database.js";

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    deadline: formatDate(task.due_date),
    dueDate: formatDate(task.due_date),
    priority: task.priority,
    status: task.status,
    userId: task.user_id,
    completed: task.status === "completed",
    createdAt: task.created_at,
  };
}

function validateTaskPayload(payload) {
  const title = payload?.title?.trim();
  const description =
    payload?.description?.trim() || payload?.subject?.trim() || "No description provided.";
  const deadline = payload?.deadline || payload?.dueDate || payload?.due_date;

  if (!title || !description || !deadline) {
    return { error: "Title, description, and deadline are required." };
  }

  const normalizedDate = formatDate(deadline);

  if (!normalizedDate) {
    return { error: "Deadline must be a valid date." };
  }

  let status = "pending";

  if (typeof payload?.status === "string") {
    const normalizedStatus = payload.status.trim().toLowerCase();

    if (["pending", "completed"].includes(normalizedStatus)) {
      status = normalizedStatus;
    }
  }

  if (typeof payload?.completed === "boolean") {
    status = payload.completed ? "completed" : "pending";
  }

  let priority = "medium";

  if (typeof payload?.priority === "string") {
    const normalizedPriority = payload.priority.trim().toLowerCase();

    if (["high", "medium", "low"].includes(normalizedPriority)) {
      priority = normalizedPriority;
    }
  }

  const userId = Number(payload?.userId ?? payload?.user_id ?? 1);

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "User id must be a valid number." };
  }

  return {
    title,
    description,
    deadline: normalizedDate,
    priority,
    status,
    userId,
  };
}

export async function getTasks(_request, response) {
  const result = await query(
    `SELECT id, title, description, due_date, priority, status, user_id, created_at
     FROM tasks
     ORDER BY created_at DESC, id DESC`
  );

  response.json(result.rows.map(serializeTask));
}

export async function createTask(request, response) {
  const validatedTask = validateTaskPayload(request.body);

  if (validatedTask.error) {
    response.status(400).json({ error: validatedTask.error });
    return;
  }

  const result = await query(
    `INSERT INTO tasks (title, description, due_date, priority, status, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, description, due_date, priority, status, user_id, created_at`,
    [
      validatedTask.title,
      validatedTask.description,
      validatedTask.deadline,
      validatedTask.priority,
      validatedTask.status,
      validatedTask.userId,
    ]
  );

  response.status(201).json(serializeTask(result.rows[0]));
}

export async function updateTask(request, response) {
  const taskId = Number(request.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    response.status(400).json({ error: "Task id must be a valid number." });
    return;
  }

  const validatedTask = validateTaskPayload(request.body);

  if (validatedTask.error) {
    response.status(400).json({ error: validatedTask.error });
    return;
  }

  const result = await query(
    `UPDATE tasks
     SET title = $1,
         description = $2,
         due_date = $3,
         priority = $4,
         status = $5,
         user_id = $6
     WHERE id = $7
     RETURNING id, title, description, due_date, priority, status, user_id, created_at`,
    [
      validatedTask.title,
      validatedTask.description,
      validatedTask.deadline,
      validatedTask.priority,
      validatedTask.status,
      validatedTask.userId,
      taskId,
    ]
  );

  if (result.rowCount === 0) {
    response.status(404).json({ error: "Task not found." });
    return;
  }

  response.json(serializeTask(result.rows[0]));
}

export async function deleteTask(request, response) {
  const taskId = Number(request.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    response.status(400).json({ error: "Task id must be a valid number." });
    return;
  }

  const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [taskId]);

  if (result.rowCount === 0) {
    response.status(404).json({ error: "Task not found." });
    return;
  }

  response.status(204).send();
}