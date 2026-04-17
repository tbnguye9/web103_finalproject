import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./index.css";

function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Finish math homework",
      subject: "Math",
      deadline: "2026-04-20",
      completed: false,
    },
    {
      id: 2,
      title: "Review biology notes",
      subject: "Biology",
      deadline: "2026-04-21",
      completed: false,
    },
  ]);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StudyBuddy Planner</h1>
        <p>Plan your study tasks and stay organized.</p>
      </header>

      <main className="main-layout">
        <TaskForm onAddTask={handleAddTask} />
        <TaskList tasks={tasks} />
      </main>
    </div>
  );
}

export default App;
