import { query } from "./config/database.js";

const seedUsers = [
  ["StudyBuddy Demo User", "demo@studybuddy.local"],
];

const seedTasks = [
  [
    "Finish math homework",
    "Complete chapters 3 and 4 practice problems before class.",
    "2026-04-20",
    "high",
    "pending",
    1,
  ],
  [
    "Review biology notes",
    "Summarize cell respiration notes and prepare flashcards.",
    "2026-04-21",
    "medium",
    "pending",
    1,
  ],
];

async function resetDatabase() {
  await query("DROP TABLE IF EXISTS tasks");
  await query("DROP TABLE IF EXISTS users");

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      due_date DATE NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  for (const [fullName, email] of seedUsers) {
    await query(
      `INSERT INTO users (full_name, email)
       VALUES ($1, $2)`,
      [fullName, email]
    );
  }

  for (const [title, description, dueDate, priority, status, userId] of seedTasks) {
    await query(
      `INSERT INTO tasks (title, description, due_date, priority, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, description, dueDate, priority, status, userId]
    );
  }

  console.log("Database reset complete.");
}

resetDatabase()
  .catch((error) => {
    console.error("Database reset failed.", error);
    process.exitCode = 1;
  });