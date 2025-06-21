const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

const authRoutes = require('./routes/auth')(db);
const loadRoutes = require('./routes/load')(db, upload);
const messageRoutes = require('./routes/message')(db, upload);

app.use('/auth', authRoutes);
app.use('/loads', loadRoutes);
app.use('/messages', messageRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
