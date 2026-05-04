const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// 1. Налаштування CORS
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// 2. Підключення до БД
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "student_tasks",
});

db.connect((err) => {
  if (err) {
    console.error("❌ ПОМИЛКА: Не вдалося підключитися до MySQL!");
    console.error("Повідомлення:", err.message);
  } else {
    console.log("✅ База MySQL підключена успішно");
  }
});

// --- РОУТ ДЛЯ РЕЄСТРАЦІЇ КОРИСТУВАЧІВ ---
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Використовуємо назви колонок, які ми бачили в твоїй базі: username, email, password_hash
  const query =
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      console.error("❌ Помилка при реєстрації:", err.message);
      // Якщо email вже зайнятий (Unique constraint), повертаємо помилку
      return res
        .status(500)
        .json({ error: "Цей email або ім'я вже використовуються" });
    }
    console.log("✅ Новий користувач доданий у базу!");
    res.json({ message: "Реєстрація успішна!", id: result.insertId });
  });
});

// --- РОУТИ ДЛЯ ТАСКІВ ---

app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/tasks", (req, res) => {
  const { title, category, status, description } = req.body;
  const query =
    "INSERT INTO tasks (title, category, status, user_id, description) VALUES (?, ?, ?, 1, ?)";
  db.query(
    query,
    [title, category, status, description || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, ...req.body });
    },
  );
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, category, status, description } = req.body;
  const query =
    "UPDATE tasks SET title = ?, category = ?, status = ?, description = ? WHERE id = ?";
  db.query(
    query,
    [title, category, status, description || "", id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Дані оновлено" });
    },
  );
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Видалено" });
  });
});

// --- РОУТИ ДЛЯ НОТАТОК (NOTICES) ---

app.get("/notices", (req, res) => {
  db.query("SELECT * FROM notices ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/notices", (req, res) => {
  const { title, content, tag } = req.body;
  const query =
    "INSERT INTO notices (title, content, tag, user_id) VALUES (?, ?, ?, 1)";
  db.query(query, [title, content, tag || "personal"], (err, result) => {
    if (err) {
      console.error("❌ Помилка при додаванні нотатки:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, ...req.body });
  });
});

// Оновити нотатку (виправлено)
app.put("/notices/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, tag } = req.body;
  const query =
    "UPDATE notices SET title = ?, content = ?, tag = ? WHERE id = ?";
  db.query(query, [title, content, tag, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Нотатку оновлено успішно" });
  });
});

app.delete("/notices/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM notices WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Нотатку видалено" });
  });
});

// --- СТАТИСТИКА ---

app.get("/stats", (req, res) => {
  const query = "SELECT status, COUNT(*) as count FROM tasks GROUP BY status";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const statsObj = { todo: 0, process: 0, done: 0 };
    result.forEach((row) => {
      if (statsObj.hasOwnProperty(row.status)) {
        statsObj[row.status] = row.count;
      }
    });

    const formattedResponse = Object.keys(statsObj).map((key) => ({
      status: key,
      count: statsObj[key],
    }));

    res.json(formattedResponse);
  });
});

// 3. Запуск сервера
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
