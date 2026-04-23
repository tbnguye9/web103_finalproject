function TaskList({ errorMessage, isLoading, onDeleteTask, onEditTask, tasks, user }) {
  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <div>
          <h2>Task List</h2>
          <p className="form-note">Signed in as {user.email}</p>
        </div>
      </div>

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
                <strong>Description:</strong> {task.description || task.subject}
              </p>

              <p>
                <strong>Deadline:</strong> {task.deadline}
              </p>

              <p>
                <strong>Priority:</strong> {task.priority}
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
