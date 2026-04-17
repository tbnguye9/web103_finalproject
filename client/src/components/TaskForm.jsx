import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim() || !deadline) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      subject: subject.trim(),
      deadline,
      completed: false,
    };

    onAddTask(newTask);

    setTitle("");
    setSubject("");
    setDeadline("");
  };

  return (
    <section className="task-form-section">
      <h2>Create / Edit Task</h2>
      <p className="form-note">
        This reusable form can be used to create or edit a study task.
      </p>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button type="submit">Save Task</button>
      </form>
    </section>
  );
}

export default TaskForm;
