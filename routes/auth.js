const express = require('express');
const router = express.Router();

module.exports = function(db) {
  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
      if (err) return res.status(500).send("Server error");
      if (!user) return res.status(401).send("Invalid login");

      req.session.user = user;
      res.redirect('/dashboard');
    });
  });

  return router;
};