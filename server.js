const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Make sure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Setup SQLite DB folder
if (!fs.existsSync('db')) fs.mkdirSync('db');

const db = new sqlite3.Database('./db/fleetbord.db', (err) => {
  if (err) {
    console.error('Could not connect to DB', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables if they don't exist
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

  // Create default admin user if not exists
  db.get("SELECT * FROM users WHERE username = 'Sean'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['Sean', '1', 'admin']);
      console.log("Created default admin user Sean");
    }
  });
});

// Middleware
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'fleetbordSecret',
  resave: false,
  saveUninitialized: true,
}));

// Import routes
const authRoutes = require('./routes/auth')(db);
const loadRoutes = require('./routes/load')(db, upload);
const messageRoutes = require('./routes/message')(db, upload);

// Use routes
app.use('/auth', authRoutes);
app.use('/loads', loadRoutes);
app.use('/messages', messageRoutes);

// Catch all to serve index.html (optional, for SPA or redirect)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});