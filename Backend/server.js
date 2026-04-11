const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Дозволяємо запити з Live Server
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_tasks'
});

db.connect(err => {
    if (err) console.error('❌ Помилка БД:', err.message);
    else console.log('✅ База MySQL підключена');
});

// ОТРИМАТИ ВСІ ТАСКИ
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ДОДАТИ ТАСК
app.post('/tasks', (req, res) => {
    const { title, category, status, description } = req.body;
    const query = 'INSERT INTO tasks (title, category, status, user_id, description) VALUES (?, ?, ?, 1, ?)';
    db.query(query, [title, category, status, description || ''], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

// ОНОВИТИ ТАСК
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, category, status, description } = req.body;
    const query = 'UPDATE tasks SET title = ?, category = ?, status = ?, description = ? WHERE id = ?';
    db.query(query, [title, category, status, description || '', id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Дані оновлено" });
    });
});

// ВИДАЛИТИ ТАСК
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Видалено" });
    });
});

// СТАТИСТИКА
app.get('/stats', (req, res) => {
    const query = 'SELECT status, COUNT(*) as count FROM tasks GROUP BY status';
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(5000, () => console.log(`🚀 Сервер на порту 5000`));