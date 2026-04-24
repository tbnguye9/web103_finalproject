import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./index.css";

const authStorageKey = "studybuddy-auth";

function getStoredSession() {
  const storedValue = window.localStorage.getItem(authStorageKey);

  if (!storedValue) {
    return { token: "", user: null };
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return {
      token: parsedValue?.token || "",
      user: parsedValue?.user || null,
    };
  } catch {
    return { token: "", user: null };
  }
}

function saveSession(token, user) {
  window.localStorage.setItem(authStorageKey, JSON.stringify({ token, user }));
}

function clearStoredSession() {
  window.localStorage.removeItem(authStorageKey);
}

function App() {
  const initialUrl = new URL(window.location.href);
  const initialResetMode = initialUrl.searchParams.get("mode") === "reset";
  const [{ token: storedToken, user: storedUser }] = useState(getStoredSession);
  const [authMode, setAuthMode] = useState(
    initialResetMode ? "reset" : "login",
  );
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: initialUrl.searchParams.get("email") || "",
    password: "",
    confirmPassword: "",
    token: initialUrl.searchParams.get("token") || "",
  });
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [previewResetUrl, setPreviewResetUrl] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(
    Boolean(storedToken),
  );
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(storedUser);
  const [editingTask, setEditingTask] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    clearStoredSession();
    setToken("");
    setUser(null);
    setTasks([]);
    setEditingTask(null);
    setAuthMode("login");
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!storedToken) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired.");
        }

        const data = await response.json();
        setUser(data.user);
        saveSession(storedToken, data.user);
      } catch (error) {
        clearStoredSession();
        setToken("");
        setUser(null);
        setAuthError(
          error.message || "Your session has expired. Please log in again.",
        );
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, [storedToken]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!token) {
        setTasks([]);
        setEditingTask(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await fetch("/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error("Unable to load tasks.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        const message = error.message || "Unable to load tasks.";
        setErrorMessage(message);

        if (message.includes("session")) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [token]);

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    setAuthError("");
    setAuthMessage("");
    setPreviewResetUrl("");

    const url = new URL(window.location.href);

    if (nextMode === "reset") {
      url.searchParams.set("mode", "reset");
    } else {
      url.searchParams.delete("mode");
      url.searchParams.delete("token");
    }

    if (nextMode !== "reset") {
      url.searchParams.delete("email");
      setAuthForm((prev) => ({
        ...prev,
        token: "",
      }));
    }

    window.history.replaceState({}, "", url);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthError("");
    setAuthMessage("");
    setPreviewResetUrl("");

    try {
      const endpointByMode = {
        login: "/api/auth/login",
        signup: "/api/auth/signup",
        forgot: "/api/auth/forgot-password",
        reset: "/api/auth/reset-password",
      };

      const requestBodyByMode = {
        login: {
          email: authForm.email,
          password: authForm.password,
        },
        signup: {
          fullName: authForm.fullName,
          email: authForm.email,
          password: authForm.password,
        },
        forgot: {
          email: authForm.email,
        },
        reset: {
          email: authForm.email,
          password: authForm.password,
          token: authForm.token,
        },
      };

      if (
        authMode === "reset" &&
        authForm.password !== authForm.confirmPassword
      ) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch(endpointByMode[authMode], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBodyByMode[authMode]),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Unable to ${authMode}.`);
      }

      if (authMode === "forgot") {
        setAuthMessage(
          data.message ||
            "If an account matches that email, a reset link has been sent.",
        );
        setPreviewResetUrl(data.previewResetUrl || "");
        return;
      }

      if (authMode === "reset") {
        setAuthMessage(data.message || "Password updated successfully.");
        setAuthForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
          token: "",
        }));
        switchAuthMode("login");
        return;
      }

      setToken(data.token);
      setUser(data.user);
      saveSession(data.token, data.user);
      setAuthForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        token: "",
      });
    } catch (error) {
      setAuthError(error.message || `Unable to ${authMode}.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCreateTask = async (taskDetails) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create task.");
      }

      setTasks((prev) => [data, ...prev]);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async (taskDetails) => {
    if (!editingTask) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update task.");
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === data.id ? data : task)),
      );
      setEditingTask(null);
    } catch (error) {
      setErrorMessage(error.message || "Unable to update task.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setErrorMessage("");
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          priority: task.priority,
          completed: !task.completed,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update task.");
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } catch (error) {
      setErrorMessage(error.message || "Unable to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessageFromServer = "Unable to delete task.";

        try {
          const data = await response.json();
          errorMessageFromServer = data.error || errorMessageFromServer;
        } catch {
          // Ignore non-JSON delete responses.
        }

        throw new Error(errorMessageFromServer);
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete task.");
    }
  };

  if (isCheckingSession) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>Restoring your workspace</h1>
          <p className="auth-subtitle">Checking your saved session.</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    const isSignup = authMode === "signup";
    const isForgot = authMode === "forgot";
    const isReset = authMode === "reset";

    return (
      <div className="auth-shell">
        <section className="auth-showcase">
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>Private study planning for every semester sprint.</h1>
          <p className="auth-subtitle">
            Create an account to keep your assignments, deadlines, and
            priorities tied to your own workspace.
          </p>

          <div className="auth-highlights">
            <div>
              <strong>Secure accounts</strong>
              <span>Tasks stay attached to the signed-in user.</span>
            </div>
            <div>
              <strong>Fast capture</strong>
              <span>Add classes, assignments, and deadlines in one flow.</span>
            </div>
            <div>
              <strong>Stay focused</strong>
              <span>Pick up where you left off with a saved session.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          {!isForgot && !isReset ? (
            <div
              className="auth-tabs"
              role="tablist"
              aria-label="Authentication options"
            >
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => switchAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === "signup" ? "active" : ""}
                onClick={() => switchAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>
          ) : null}

          <h2>
            {isSignup
              ? "Create your account"
              : isForgot
                ? "Reset your password"
                : isReset
                  ? "Choose a new password"
                  : "Welcome back"}
          </h2>
          <p className="form-note">
            {isSignup
              ? "Set up your planner account to keep tasks private and persistent."
              : isForgot
                ? "Enter your email and we will send you a reset link."
                : isReset
                  ? "Set a new password for your account using the reset link you opened."
                  : "Log in to view and manage your study tasks."}
          </p>

          <form className="task-form auth-form" onSubmit={handleAuthSubmit}>
            {isSignup ? (
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={authForm.fullName}
                onChange={handleAuthInputChange}
                required
              />
            ) : null}

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={handleAuthInputChange}
              readOnly={isReset}
              required
            />

            {!isForgot ? (
              <input
                type="password"
                name="password"
                placeholder={isReset ? "New password" : "Password"}
                value={authForm.password}
                onChange={handleAuthInputChange}
                minLength={8}
                required
              />
            ) : null}

            {isReset ? (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={authForm.confirmPassword}
                onChange={handleAuthInputChange}
                required
              />
            ) : null}

            {authError ? <p className="form-error">{authError}</p> : null}
            {authMessage ? <p className="form-success">{authMessage}</p> : null}
            {previewResetUrl ? (
              <a className="auth-link-preview" href={previewResetUrl}>
                Open development reset link
              </a>
            ) : null}

            <button type="submit" disabled={isAuthenticating}>
              {isAuthenticating
                ? isSignup
                  ? "Creating account..."
                  : isForgot
                    ? "Sending reset link..."
                    : isReset
                      ? "Updating password..."
                      : "Signing in..."
                : isSignup
                  ? "Create Account"
                  : isForgot
                    ? "Send Reset Link"
                    : isReset
                      ? "Save New Password"
                      : "Log In"}
            </button>
          </form>

          <div className="auth-secondary-actions">
            {authMode === "login" ? (
              <button
                type="button"
                className="auth-link-button"
                onClick={() => switchAuthMode("forgot")}
              >
                Forgot password?
              </button>
            ) : null}

            {isForgot || isReset ? (
              <button
                type="button"
                className="auth-link-button"
                onClick={() => switchAuthMode("login")}
              >
                Back to login
              </button>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="auth-eyebrow">StudyBuddy Planner</p>
          <h1>{user.fullName.split(" ")[0]}'s Dashboard</h1>
          <p className="auth-subtitle">
            Plan your study tasks and keep them attached to your account.
          </p>
        </div>

        <div className="header-right">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="secondary-button header-button"
            type="button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="main-layout">
        <TaskForm
          key={editingTask?.id || "new-task"}
          editingTask={editingTask}
          isSaving={isSaving}
          onCancelEdit={() => setEditingTask(null)}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
        />
        <TaskList
          errorMessage={errorMessage}
          isLoading={isLoading}
          onDeleteTask={handleDeleteTask}
          onEditTask={setEditingTask}
          onToggleComplete={handleToggleComplete}
          tasks={tasks}
          user={user}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}

export default App;
