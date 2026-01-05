const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const themeToggle = document.getElementById("themeToggle");
const MAX_RECENT = 5;
let recentTasks = new Map();


let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function resetAll() {
    if (!confirm("Clear all tasks?")) return;
    tasks = [];
    recentTasks.clear();
    localStorage.removeItem("tasks");
    renderTasks();
  }
  

// Keyboard
taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTaskBtn.click();
    }
    if (e.key === "Escape") {
      taskInput.value = "";
    }
  });

  let currentFilter = "all";

function setFilter(type) {
  currentFilter = type;
  renderTasks();
}

const toggleButtons = document.querySelectorAll(".toggle");

toggleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("reset")) return;

    toggleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    setFilter(filter);
  });
});


function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById("stats").textContent =
      `Total: ${total} | Completed: ${completed}`;
  }
  

// Render tasks
function renderTasks() {
    taskList.innerHTML = "";
    let filteredTasks = tasks.map((task, index) => ({ task, index }));

if (currentFilter === "active") {
  filteredTasks = filteredTasks.filter(obj => !obj.task.completed);
} else if (currentFilter === "completed") {
  filteredTasks = filteredTasks.filter(obj => obj.task.completed);
}


filteredTasks.forEach(({ task, index }) => {

      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
  
      li.innerHTML = `
        <span class="task-text ${task.completed ? 'done' : ''}">
  ${task.text}
</span>
<small class="badge ${task.category.toLowerCase()}">
  ${task.category}
</small>


        <div>
         <button class="done-btn" onclick="toggleTask(${index})">✓</button>
<button class="delete-btn" onclick="deleteTask(${index})">×</button>

        </div>
      `;
      taskList.appendChild(li);
    });
  
    // Render LRU list
    const recentList = document.getElementById("recentList");
    if (recentList) {
      recentList.innerHTML = "";
      [...recentTasks.keys()].reverse().forEach(task => {
        const li = document.createElement("li");
        li.textContent = task;
        recentList.appendChild(li);
      });
    }
  
    updateStats();
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  

function accessTask(taskText) {
    if (recentTasks.has(taskText)) {
      recentTasks.delete(taskText);
    }
  
    recentTasks.set(taskText, Date.now());
  
    if (recentTasks.size > MAX_RECENT) {
      const oldestKey = recentTasks.keys().next().value;
      recentTasks.delete(oldestKey);
    }
  }
  

// Add task
addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
  
    if (!text) {
      alert("Task cannot be empty");
      return;
    }
  
    if (tasks.some(task => task.text === text)) {
      alert("Task already exists");
      return;
    }
  
    const categorySelect = document.getElementById("categorySelect");

    const newTask = {
      text,
      category: categorySelect.value,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
  
    tasks.unshift(newTask);
    accessTask(text);
  
    taskInput.value = "";
    renderTasks();
  });


  taskInput.addEventListener("input", () => {
    addTaskBtn.disabled = taskInput.value.trim() === "";
  });
  

// Toggle complete
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    accessTask(tasks[index].text);
    renderTasks();
  }
  

// Delete task
function deleteTask(index) {
    recentTasks.delete(tasks[index].text);
    tasks.splice(index, 1);
    renderTasks();
  }
  

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Initial render
renderTasks();
