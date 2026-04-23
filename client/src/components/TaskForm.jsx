import { useState } from "react";
import { useEffect } from "react";

const emptyTask = {
  title: "",
  subject: "",
  deadline: "",
};

function TaskForm({
  editingTask,
  isSaving,
  onCancelEdit,
  onCreateTask,
  onUpdateTask,
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState('Medium')
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const nextTask = editingTask || emptyTask;

    setTitle(nextTask.title);
    setSubject(nextTask.subject);
    setDeadline(nextTask.deadline);
    setFormError("");
  }, [editingTask]);

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setDeadline("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim() || !deadline) {
      setFormError("Enter a title, subject, and deadline before saving.");
      return;
    }

    const taskDetails = {
      title: title.trim(),
      subject: subject.trim(),
      deadline,
    };

    try {
      if (editingTask) {
        await onUpdateTask(taskDetails);
      } else {
        await onCreateTask(taskDetails);
      }

      resetForm();
    } catch {
      setFormError(
        editingTask ? "Unable to update task right now." : "Unable to save task right now."
      );
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <section className="task-form-section">
      <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
      <p className="form-note">
        {editingTask
          ? "Update the selected study task and save your changes."
          : "Add a new study task with a subject and deadline."}
      </p>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>

        {formError ? <p className="form-error">{formError}</p> : null}

        <div className="task-form-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : editingTask ? "Update Task" : "Save Task"}
          </button>

          {editingTask ? (
            <button className="secondary-button" type="button" onClick={handleCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;
