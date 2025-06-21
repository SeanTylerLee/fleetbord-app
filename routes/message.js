const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (db, upload) => {
  const router = express.Router();

  // POST /messages/dispatch
  router.post('/dispatch', upload.single('photo'), (req, res) => {
    const sender = req.session.username || 'unknown';
    const recipients = req.body.recipients;
    const instructions = req.body.instructions;
    const mapLink = req.body.mapLink || '';
    const file = req.file ? `/uploads/${req.file.filename}` : null;

    const message = {
      instructions,
      mapLink,
      photo: file
    };

    const msgText = JSON.stringify(message);
    const time = new Date().toISOString();

    db.run(
      `INSERT INTO messages (sender, recipients, message, timestamp)
       VALUES (?, ?, ?, ?)`,
      [sender, Array.isArray(recipients) ? recipients.join(',') : recipients, msgText, time],
      function (err) {
        if (err) {
          console.error('Error inserting message:', err);
          return res.status(500).send('Failed to send dispatch');
        }
        res.sendStatus(200);
      }
    );
  });

  return router;
};