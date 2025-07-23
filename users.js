
const defaultUsers = [{ username: "admin", password: "31345", role: "admin" }];
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const remember = document.getElementById("rememberMe").checked;

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        const sessionUser = { ...user, loginTime: new Date().toISOString() };
        if (remember) {
          localStorage.setItem("currentUser", JSON.stringify(sessionUser));
        } else {
          sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
        }
        location.href = "index.html";
      } else {
        document.getElementById("loginError").style.display = "block";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  let lastActivity = Date.now();
  function resetTimer() {
    lastActivity = Date.now();
  }
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);
  setInterval(() => {
    if (Date.now() - lastActivity > 600000) {
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
      if (!location.href.includes("login.html")) location.href = "login.html";
    }
  }, 60000);
});
