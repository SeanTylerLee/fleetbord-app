const express = require('express');
module.exports = function(db) {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
      if (row) {
        req.session.user = { username: row.username, role: row.role };
        res.json({ success: true, role: row.role });
      } else {
        res.json({ success: false });
      }
    });
  });

  router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  router.post('/create', (req, res) => {
    const user = req.session.user;
    if (!user || (user.role !== 'admin' && user.role !== 'office')) return res.sendStatus(403);

    const { username, password, role } = req.body;
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role], function(err) {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    });
  });

  return router;
};