function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const storedUsers = JSON.parse(localStorage.getItem('users')) || {};

  if (user === 'Admin' && pass === '31345') {
    localStorage.setItem('loggedInUser', 'Admin');
    localStorage.setItem('role', 'admin');
    window.location.href = 'admin.html';
  } else if (storedUsers[user] && storedUsers[user] === pass) {
    localStorage.setItem('loggedInUser', user);
    localStorage.setItem('role', 'driver');
    window.location.href = 'driver.html';
  } else {
    document.getElementById('login-error').innerText = 'Invalid login.';
  }
}

function addUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (username && password.length === 5) {
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('admin-message').innerText = 'User added.';
    loadUsers();
  } else {
    document.getElementById('admin-message').innerText = 'Enter valid username and 5-digit password.';
  }
}

function loadUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  let output = '<h3>Existing Users:</h3><ul>';
  for (const user in users) {
    output += `<li>${user} <button onclick="deleteUser('${user}')">Delete</button></li>`;
  }
  output += '</ul>';
  document.getElementById('user-list').innerHTML = output;
}

function deleteUser(user) {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  delete users[user];
  localStorage.setItem('users', JSON.stringify(users));
  loadUsers();
}

if (document.body.contains(document.getElementById('user-list'))) {
  if (localStorage.getItem('role') !== 'admin') {
    window.location.href = 'login.html';
  } else {
    loadUsers();
  }
}