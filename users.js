
// If no users exist, create admin
const defaultUsers = [
  { username: "admin", password: "31345", role: "admin" }
];

if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  form?.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      switch (user.role) {
        case "admin":
          window.location.href = "index.html";
          break;
        case "driver":
          window.location.href = "index.html";
          break;
        case "office":
          window.location.href = "index.html";
          break;
        case "mechanic":
          window.location.href = "page6.html";
          break;
        default:
          alert("Unknown role");
      }
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });
});
