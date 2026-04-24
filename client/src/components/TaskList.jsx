import { useState } from "react";

const PRIORITY_LABEL = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };

function TaskList({
  errorMessage,
  isLoading,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
  tasks,
  user,
  searchQuery,
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filtered = tasks.filter((t) => {
    const statusOk =
      filterStatus === "all" ||
      (filterStatus === "completed" ? t.completed : !t.completed);
    const priorityOk =
      filterPriority === "all" || t.priority === filterPriority;
    const searchOk =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusOk && priorityOk && searchOk;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const handleDelete = (taskId, taskTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${taskTitle}"?`,
    );
    if (confirmed) onDeleteTask(taskId);
  };

  const handleEdit = (task) => {
    const confirmed = window.confirm(`Edit "${task.title}"?`);
    if (confirmed) onEditTask(task);
  };

  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <div>
          <h2>Task List</h2>
          <p className="form-note">Signed in as {user.email}</p>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="progress-bar-container">
          <p className="progress-label">
            {completedCount}/{tasks.length} completed ({progress}%)
          </p>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-message">Loading tasks...</p> : null}
      {!isLoading && filtered.length === 0 ? (
        <p className="empty-message">No tasks found.</p>
      ) : (
        <div className="task-list">
          {filtered.map((task) => (
            <div
              className={`task-card ${task.completed ? "task-completed" : ""}`}
              key={task.id}
            >
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge priority-${task.priority}`}>
                  {PRIORITY_LABEL[task.priority] || task.priority}
                </span>
              </div>
              <p>
                <strong>Description:</strong> {task.description || task.subject}
              </p>
              <p>
                <strong>Deadline:</strong> {task.deadline}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {task.completed ? "✅ Completed" : "⏳ Pending"}
              </p>
              <div className="task-card-actions">
                <button type="button" onClick={() => onToggleComplete(task)}>
                  {task.completed ? "Mark Pending" : "Mark Complete"}
                </button>
                <button type="button" onClick={() => handleEdit(task)}>
                  Edit
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleDelete(task.id, task.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskList;
