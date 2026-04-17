function TaskList({ tasks }) {
  return (
    <section className="task-list-section">
      <h2>Task List</h2>

      {tasks.length === 0 ? (
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskList;
