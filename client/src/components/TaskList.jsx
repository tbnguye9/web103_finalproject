function TaskList({ errorMessage, isLoading, onDeleteTask, onEditTask, tasks }) {
  return (
    <section className="task-list-section">
      <h2>Task List</h2>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {isLoading ? <p className="empty-message">Loading tasks...</p> : null}

      {!isLoading && tasks.length === 0 ? (
        <p className="empty-message">
          No tasks yet. Add your first study task.
        </p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <h3>{task.title}</h3>

              <p>
                <strong>Subject:</strong> {task.subject}
              </p>

              <p>
                <strong>Deadline:</strong> {task.deadline}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {task.completed ? "Completed" : "Pending"}
              </p>

              <div className="task-card-actions">
                <button type="button" onClick={() => onEditTask(task)}>
                  Edit
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
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
