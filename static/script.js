
const taskForm = document.getElementById("taskForm");
const editTaskForm = document.getElementById("editTaskForm");
const editModal = new bootstrap.Modal(document.getElementById("editTaskModal"));

// Load Tasks
async function loadTasks() {
  try {
    const res = await axios.get("/show-task");
    if (res.data.status === "success") {
      const tbody = document.querySelector("#taskTable tbody");
      tbody.innerHTML = "";

      // Initialize counts
      let count_open = 0, count_inprogress = 0, count_done = 0;

      const statusFilter = document.getElementById("statusFilter").value;

      res.data.data.forEach((task, index) => {
        // Count status
        if (task.task_status === "OPEN") count_open++;
        else if (task.task_status === "IN_PROGRESS") count_inprogress++;
        else if (task.task_status === "DONE") count_done++;

        // Filter by status
        if (statusFilter !== "ALL" && task.task_status !== statusFilter) return;

        tbody.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${task.task_name}</td>
            <td>${task.task_desc}</td>
            <td>${task.task_priority}</td>
            <td>${task.task_status}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="openEditTask('${task._id}', '${task.task_name}', '${task.task_desc}', '${task.task_priority}', '${task.task_status}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">🗑️</button>
            </td>
          </tr>
        `;
      });

      // Update status counts
      document.getElementById("count_open").innerText = count_open;
      document.getElementById("count_inprogress").innerText = count_inprogress;
      document.getElementById("count_done").innerText = count_done;
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// Add Task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  try {
    const res = await axios.post("/create-task", formData);
    if (res.data.status === "success") {
      taskForm.reset();
      loadTasks();
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("Error creating task:", err);
  }
});

// Open Edit Task Modal
function openEditTask(id, name, desc, priority, status) {
  document.getElementById("edit_task_id").value = id;
  document.getElementById("edit_task_name").value = name;
  document.getElementById("edit_task_desc").value = desc;
  document.getElementById("edit_task_priority").value = priority;
  document.getElementById("edit_task_status").value = status;
  editModal.show();
}

// Update Task
editTaskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit_task_id").value;
  const formData = new FormData();
  formData.append("task_name", document.getElementById("edit_task_name").value);
  formData.append("task_desc", document.getElementById("edit_task_desc").value);
  formData.append("task_priority", document.getElementById("edit_task_priority").value);
  formData.append("task_status", document.getElementById("edit_task_status").value);

  try {
    const res = await axios.post(`/edit-task/${id}`, formData);
    if (res.data.status === "success") {
      editModal.hide();
      loadTasks();
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("Error updating task:", err);
  }
});

// Delete Task
async function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      const res = await axios.delete(`/delete-task/${id}`);
      if (res.data.status === "success") {
        loadTasks();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }
}

// Filter tasks when dropdown changes
document.getElementById("statusFilter").addEventListener("change", loadTasks);

// Initial load
document.addEventListener("DOMContentLoaded", loadTasks);
