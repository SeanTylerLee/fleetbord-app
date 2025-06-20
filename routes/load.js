const express = require('express');
module.exports = function(db, upload) {
  const router = express.Router();

  router.post('/add', upload.single('photo'), (req, res) => {
    const { user } = req.session;
    if (!user) return res.sendStatus(403);

    const { date, ticket, customer, rig, lease, price, overnights } = req.body;
    const photo = req.file ? req.file.filename : null;
    db.run("INSERT INTO loads (user, date, ticket, customer, rig, lease, price, overnights, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [user.username, date, ticket, customer, rig, lease, price, overnights, photo],
      function(err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true });
      });
  });

  router.get('/my-loads', (req, res) => {
    const { user } = req.session;
    if (!user) return res.sendStatus(403);

    db.all("SELECT * FROM loads WHERE user = ?", [user.username], (err, rows) => {
      res.json(rows || []);
    });
  });

  return router;
};