const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Send a message
  router.post('/send', (req, res) => {
    const { sender, recipients, message } = req.body;
    const timestamp = new Date().toISOString();
    const recipientList = Array.isArray(recipients) ? recipients.join(',') : recipients;

    db.run(`INSERT INTO messages (sender, recipients, message, timestamp)
            VALUES (?, ?, ?, ?)`,
            [sender, recipientList, message, timestamp],
            function(err) {
              if (err) return res.status(500).send("Error sending message");
              res.sendStatus(200);
            });
  });

  // Get messages for a specific user
  router.get('/inbox/:username', (req, res) => {
    const username = req.params.username;

    db.all(`SELECT * FROM messages WHERE recipients LIKE ? OR recipients LIKE ? OR recipients LIKE ? OR recipients = ? ORDER BY timestamp DESC`,
      [`${username},%`, `%,${username},%`, `%,${username}`, username], (err, rows) => {
      if (err) return res.status(500).send("Error retrieving messages");
      res.json(rows);
    });
  });

  return router;
};