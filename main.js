const users = [
  { username: "A", password: "1", role: "admin" },
  // Dispatchers, Mechanics, Drivers, Office will be created by admin or dispatcher
];

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();

  const user = users.find(user => user.username === u && user.password === p);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    switch (user.role) {
      case "admin": window.location.href = "admin.html"; break;
      case "dispatcher": window.location.href = "dispatcher.html"; break;
      case "driver": window.location.href = "driver.html"; break;
      case "mechanic": window.location.href = "mechanic.html"; break;
      case "office": window.location.href = "office.html"; break;
    }
  } else {
    alert("Invalid credentials");
  }
}