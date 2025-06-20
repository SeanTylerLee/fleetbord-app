const express = require('express');
module.exports = function(db) {
  const router = express.Router();

  router.post('/send', (req, res) => {
    const { user } = req.session;
    if (!user) return res.sendStatus(403);

    const { recipients, message } = req.body;
    db.run("INSERT INTO messages (sender, recipients, message, timestamp) VALUES (?, ?, ?, ?)",
      [user.username, recipients, message, new Date().toISOString()],
      function(err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true });
      });
  });

  router.get('/inbox', (req, res) => {
    const { user } = req.session;
    if (!user) return res.sendStatus(403);

    db.all("SELECT * FROM messages WHERE recipients LIKE ? ORDER BY timestamp DESC", [`%${user.username}%`], (err, rows) => {
      res.json(rows || []);
    });
  });

  return router;
};