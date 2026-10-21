const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'task_db',
});

async function initDB() {
  const queryText = 
    'CREATE TABLE IF NOT EXISTS tasks (' +
    '  id SERIAL PRIMARY KEY,' +
    '  title VARCHAR(255) NOT NULL,' +
    '  deadline DATE,' +
    '  status VARCHAR(50) DEFAULT \'Todo\',' +
    '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');';
  await pool.query(queryText);
}
initDB().catch(console.error);

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, deadline, status } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, deadline, status) VALUES ($1, $2, $3) RETURNING *',
      [title, deadline, status || 'Todo']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  const html = 
    '<!DOCTYPE html>' +
    '<html>' +
    '<head><title>Task Tracker</title></head>' +
    '<body style="font-family: Arial, sans-serif; padding: 20px;">' +
    '  <h2>Task Tracker - De 24</h2>' +
    '  <form id="taskForm">' +
    '    <input type="text" id="title" placeholder="Tieu de cong viec" required /> ' +
    '    <input type="date" id="deadline" required /> ' +
    '    <select id="status">' +
    '      <option value="Todo">Todo</option>' +
    '      <option value="In Progress">In Progress</option>' +
    '      <option value="Done">Done</option>' +
    '    </select> ' +
    '    <button type="submit">Them Task</button>' +
    '  </form>' +
    '  <hr/>' +
    '  <h3>Danh sach cong viec:</h3>' +
    '  <ul id="taskList"></ul>' +
    '  <script>' +
    '    async function loadTasks() {' +
    '      const res = await fetch("/api/tasks");' +
    '      const tasks = await res.json();' +
    '      document.getElementById("taskList").innerHTML = tasks.map(t => ' +
    '        "<li><b>[" + t.status + "]</b> " + t.title + " (Han: " + (t.deadline ? t.deadline.slice(0, 10) : "N/A") + ")</li>"' +
    '      ).join("");' +
    '    }' +
    '    document.getElementById("taskForm").onsubmit = async (e) => {' +
    '      e.preventDefault();' +
    '      await fetch("/api/tasks", {' +
    '        method: "POST",' +
    '        headers: {"Content-Type": "application/json"},' +
    '        body: JSON.stringify({' +
    '          title: document.getElementById("title").value,' +
    '          deadline: document.getElementById("deadline").value,' +
    '          status: document.getElementById("status").value' +
    '        })' +
    '      });' +
    '      document.getElementById("title").value = "";' +
    '      loadTasks();' +
    '    };' +
    '    loadTasks();' +
    '  </script>' +
    '</body>' +
    '</html>';
  res.send(html);
});

app.listen(3000, () => {
  console.log('Task Tracker app running on port 3000');
});