const API = "http://localhost:5000";

window.onload = () => {
  setDate();
  checkAuth();
  getTasks();
};

// 📅 Date
function setDate() {
  const d = new Date();
  document.getElementById("date").innerText = d.toDateString();
}

// 🔐 Check Login
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    document.querySelector(".right-section").innerHTML = `
      <span>👤 ${user.email}</span>
      <button onclick="logout()">Logout</button>
    `;
  }
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ➕ Add Task
async function addTask() {
  const title = document.getElementById("taskInput").value;
  const plannedDays = document.getElementById("plannedDays").value;

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return alert("Login first");

  if (!title || !plannedDays) return alert("Enter all fields");

  await fetch("/add-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      plannedDays,
      email: user.email
    })
  });

  document.getElementById("taskInput").value = "";
  document.getElementById("plannedDays").value = "";

  getTasks();
}
// 📋 Get Tasks (USER-SPECIFIC)
async function getTasks() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  // ✅ Get tasks
  const res = await fetch(`/tasks?email=${user.email}`);
  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  let completedTasks = 0;
  let totalDays = 0;
  let completedDays = 0;

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";

    const taskAccuracy =
      task.plannedDays === 0
        ? 0
        : (task.progressDays / task.plannedDays) * 100;

    totalDays += task.plannedDays;
    completedDays += task.progressDays;

    if (task.progressDays === task.plannedDays) {
      completedTasks++;
    }

    div.innerHTML = `
      <div class="task-left">
        <h4>${task.title}</h4>
        <p>${task.progressDays}/${task.plannedDays} days</p>
      </div>

      <div class="task-right">
        <span class="task-accuracy">
          ${taskAccuracy.toFixed(0)}%
        </span>

        ${
          !task.started
            ? `<button onclick="startTask('${task._id}')">▶ Start</button>`
            : `<button onclick="markDayComplete('${task._id}')">✔ Day Done</button>`
        }
      </div>
    `;

    list.appendChild(div);
  });

  const accuracy =
    totalDays === 0 ? 0 : (completedDays / totalDays) * 100;

  document.getElementById("accuracy").innerText =
    accuracy.toFixed(0) + "%";

  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("completedTasks").innerText = completedTasks;
}

// ✅ Complete Task
async function completeTask(id) {
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch(`/tasks?email=${user.email}`);
  const tasks = await res.json();

  const task = tasks.find(t => t._id === id);

  if (!task.startTime) {
    return alert("Start the task first!");
  }

  const endTime = new Date();
  const startTime = new Date(task.startTime);

  const diffDays = (endTime - startTime) / (1000 * 60 * 60 * 24);

  const completedOnTime = diffDays <= task.plannedDays;

  await fetch(`/task/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "completed",
      endTime,
      actualDays: diffDays,
      completedOnTime
    })
  });

  getTasks();
}
// 🔓 Open Modals
function openLogin() {
  document.getElementById("loginModal").style.display = "flex";
}

function openSignup() {
  document.getElementById("signupModal").style.display = "flex";
}

// ❌ Close Modals
function closeModals() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("signupModal").style.display = "none";
}
// signup
async function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const res = await fetch("/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.success) {
    alert("Signup successful!");

    // 🔄 Switch to login automatically
    switchToLogin();
  } else {
    alert(data.message || "Signup failed");
  }
}

// 🔑 Login
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful!");

    // ✅ Close modal
    closeModals();

    // ✅ Reload (redirect effect)
    location.reload();
  } else {
    alert("Invalid credentials");
  }
}
function switchToSignup() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("signupModal").style.display = "flex";
}

function switchToLogin() {
  document.getElementById("signupModal").style.display = "none";
  document.getElementById("loginModal").style.display = "flex";
}
function closeModals() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("signupModal").style.display = "none";
}
async function startTask(id) {
  await fetch(`/task/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startTime: new Date()
    })
  });

  alert("Task Started 🚀");
}
async function startTask(id) {
  await fetch(`/task/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      started: true
    })
  });

  getTasks();
}
async function markDayComplete(id) {
  await fetch(`/task/${id}/progress`, {
    method: "PUT"
  });

  getTasks();
}