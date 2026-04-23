import { useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  deadline: "",
};

function TaskForm({
  editingTask,
  isSaving,
  onCancelEdit,
  onCreateTask,
  onUpdateTask,
}) {
  const initialTask = editingTask || emptyTask;
  const [title, setTitle] = useState(initialTask.title || "");
  const [description, setDescription] = useState(
    initialTask.description || initialTask.subject || ""
  );
  const [deadline, setDeadline] = useState(initialTask.deadline || "");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !deadline) {
      setFormError("Enter a title, description, and deadline before saving.");
      return;
    }

    const taskDetails = {
      title: title.trim(),
      description: description.trim(),
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
          : "Add a new study task with details and a deadline."}
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
          placeholder="Description or subject"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

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
