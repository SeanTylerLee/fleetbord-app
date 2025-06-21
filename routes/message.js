const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = (db, upload) => {
  // 📤 Send a dispatch message (with optional photo and map link)
  router.post('/dispatch', upload.single('photo'), (req, res) => {
    const { sender, recipients, message, mapLink } = req.body;
    const timestamp = new Date().toISOString();
    const recipientsStr = Array.isArray(recipients) ? recipients.join(',') : recipients;

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const content = {
      text: message,
      photo: photoPath,
      mapLink: mapLink || null
    };

    db.run(
      'INSERT INTO messages (sender, recipients, message, timestamp) VALUES (?, ?, ?, ?)',
      [sender, recipientsStr, JSON.stringify(content), timestamp],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });

  // 📥 Get all messages received by a user
  router.get('/inbox/:username', (req, res) => {
    const username = req.params.username;

    db.all(
      'SELECT * FROM messages WHERE recipients LIKE ? ORDER BY timestamp DESC',
      [`%${username}%`],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const formattedMessages = rows.map((row) => {
          let parsed;
          try {
            parsed = JSON.parse(row.message);
          } catch {
            parsed = { text: row.message };
          }

          return {
            id: row.id,
            sender: row.sender,
            recipients: row.recipients.split(','),
            message: parsed.text,
            photo: parsed.photo,
            mapLink: parsed.mapLink,
            timestamp: row.timestamp
          };
        });

        res.json(formattedMessages);
      }
    );
  });

  return router;
};
 