const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = function(db, upload) {
  // Add a new load
  router.post('/add', upload.single('photo'), (req, res) => {
    const { user, date, ticket, customer, rig, lease, price, overnights } = req.body;
    const photo = req.file ? req.file.filename : null;

    db.run(`INSERT INTO loads (user, date, ticket, customer, rig, lease, price, overnights, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user, date, ticket, customer, rig, lease, price, overnights, photo],
            function(err) {
              if (err) return res.status(500).send("Error adding load");
              res.redirect('/dashboard');
            });
  });

  // Get all loads for user
  router.get('/user/:username', (req, res) => {
    const username = req.params.username;
    db.all("SELECT * FROM loads WHERE user = ?", [username], (err, rows) => {
      if (err) return res.status(500).send("Error fetching loads");
      res.json(rows);
    });
  });

  // Delete a load by ID
  router.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM loads WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).send("Error deleting load");
      res.sendStatus(200);
    });
  });

  return router;
};