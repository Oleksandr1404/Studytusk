const modal = document.getElementById('taskModal');
const taskList = document.getElementById('taskList');
const saveBtn = document.getElementById('saveBtn');
const modalTitle = document.getElementById('modalTitle');
const API_URL = 'http://localhost:5000/tasks';

// Завантаження тасків з бази при старті
async function loadTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => renderTaskCard(task));
}

// Функція для малювання картки
function renderTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${task.id}`;
    card.innerHTML = `
        <h3>${task.title}</h3>
        <p class="type-text" style="opacity: 0.7;">${task.category}</p>
        <span class="status-tag ${task.status}">${task.status}</span>
        <div style="margin-top:15px; display:flex; gap:15px;">
            <button onclick="prepareEdit(${task.id}, '${task.title}', '${task.category}', '${task.status}')" style="color:orange; background:none; border:none; cursor:pointer; font-weight:bold;">Edit</button>
            <button onclick="deleteTask(${task.id})" style="color:coral; background:none; border:none; cursor:pointer; font-weight:bold;">Delete</button>
        </div>
    `;
    taskList.appendChild(card);
}

// Збереження (Створення або Оновлення)
async function saveTask() {
    const title = document.getElementById('taskTitle').value;
    const category = document.getElementById('taskType').value;
    const status = document.getElementById('taskStatus').value;
    const editId = document.getElementById('editTaskId').value;

    if (!title.trim()) return alert("Enter title!");

    const taskData = { title, category, status };

    if (editId) {
        // Оновлення в БД
        await fetch(`${API_URL}/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
    } else {
        // Створення в БД
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
    }
    
    closeModal();
    loadTasks(); // Перемальовуємо все з актуальними даними
}

// Видалення
async function deleteTask(id) {
    if(confirm("Видалити?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}

// Підготовка до редагування
function prepareEdit(id, title, category, status) {
    document.getElementById('editTaskId').value = id;
    document.getElementById('taskTitle').value = title;
    document.getElementById('taskType').value = category;
    document.getElementById('taskStatus').value = status;

    modalTitle.innerText = 'Edit Task';
    saveBtn.innerText = 'Update';
    modal.style.display = 'flex';
}

// Модалка (відкриття/закриття)
document.getElementById('openModalBtn').onclick = () => {
    resetForm();
    modalTitle.innerText = 'Add New Task';
    saveBtn.innerText = 'Save';
    modal.style.display = 'flex';
};

function closeModal() { modal.style.display = 'none'; }
function resetForm() {
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskTitle').value = '';
}

window.onload = loadTasks;
window.onclick = (e) => { if (e.target == modal) closeModal(); };