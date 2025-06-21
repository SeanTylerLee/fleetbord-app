const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'fleetbordSecret', resave: false, saveUninitialized: true }));

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('db')) fs.mkdirSync('db');

const db = new sqlite3.Database('./db/fleetbord.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    recipients TEXT,
    message TEXT,
    timestamp TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS loads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    date TEXT,
    ticket TEXT,
    customer TEXT,
    rig TEXT,
    lease TEXT,
    price REAL,
    overnights INTEGER,
    photo TEXT
  )`);

  db.get("SELECT * FROM users WHERE username = 'Sean'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['Sean', '1', 'admin']);
      console.log("Created default admin user Sean");
    }
  });
});

// Import your routes - make sure these files exist
const authRoutes = require('./routes/auth')(db);
const loadRoutes = require('./routes/load')(db, upload);
const messageRoutes = require('./routes/message')(db);

app.use('/auth', authRoutes);
app.use('/loads', loadRoutes);
app.use('/messages', messageRoutes);

// New Dashboard summary API endpoint
app.get('/api/dashboard-summary', (req, res) => {
  const totalUsersPromise = new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const loadsTodayPromise = new Promise((resolve, reject) => {
    const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    db.get("SELECT COUNT(*) AS count FROM loads WHERE date = ?", [today], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const pendingDispatchesPromise = new Promise((resolve, reject) => {
    // Adjust this query based on your dispatch logic and schema
    db.get("SELECT COUNT(*) AS count FROM messages WHERE message LIKE '%dispatch%' AND timestamp >= date('now','-1 day')", (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const unreadMessagesPromise = new Promise((resolve, reject) => {
    // Simplified: count messages in last day as "unread"
    db.get("SELECT COUNT(*) AS count FROM messages WHERE timestamp >= date('now','-1 day')", (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  Promise.all([totalUsersPromise, loadsTodayPromise, pendingDispatchesPromise, unreadMessagesPromise])
    .then(([usersCount, loadsCount, dispatchesCount, messagesCount]) => {
      res.json({
        totalUsers: usersCount || 0,
        loadsToday: loadsCount || 0,
        pendingDispatches: dispatchesCount || 0,
        unreadMessages: messagesCount || 0
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));