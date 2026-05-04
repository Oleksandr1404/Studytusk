document.addEventListener("DOMContentLoaded", function () {
  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const addNoteModal = document.getElementById("addNoteModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const noteForm = document.getElementById("noteForm");
  const emptyState = document.getElementById("emptyState");
  const modalTitle = document.querySelector(".modal-title");

  const API_URL = "http://localhost:5000/notices";

  // Змінна для збереження ID нотатки, яку редагуємо
  let editModeId = null;

  // --- 1. КЕРУВАННЯ МОДАЛКОЮ ---
  const showModal = (isEdit = false) => {
    addNoteModal.style.display = "flex";
    addNoteModal.classList.add("active");
    modalTitle.innerText = isEdit ? "Edit Notice" : "New Notice";
  };

  const hideModal = () => {
    addNoteModal.style.display = "none";
    addNoteModal.classList.remove("active");
    noteForm.reset();
    editModeId = null; // Скидаємо режим редагування
  };

  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", () => showModal(false));
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideModal);
  }

  // --- 2. ВІДОБРАЖЕННЯ ТА РЕДАГУВАННЯ ---
  async function fetchNotes() {
    try {
      const response = await fetch(API_URL);
      const notes = await response.json();
      renderNotes(notes);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  }

  function renderNotes(notes) {
    if (!notesContainer) return;
    notesContainer.innerHTML = "";

    if (notes.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      return;
    } else if (emptyState) {
      emptyState.style.display = "none";
    }

    notes.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note-card fade-in";
      noteElement.innerHTML = `
        <div class="note-header">
            <h3 class="note-title">${note.title || "Без заголовка"}</h3>
            <div class="note-actions">
                <button class="edit-btn" onclick="openEditModal(${JSON.stringify(note).replace(/"/g, "&quot;")})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="note-text">${note.content}</p>
        <div class="note-footer">
            <span class="tag-label tag-${(note.tag || "personal").toLowerCase()}">
                ${note.tag || "Personal"}
            </span>
        </div>`;
      notesContainer.appendChild(noteElement);
    });
  }

  // Функція заповнення форми для редагування
  window.openEditModal = (note) => {
    editModeId = note.id;
    document.getElementById("noteTitle").value = note.title;
    document.getElementById("noteContent").value = note.content;

    // Вибираємо потрібний радіо-баттон тега
    const tagInput = document.querySelector(
      `input[name="noteTag"][value="${note.tag.toLowerCase()}"]`,
    );
    if (tagInput) tagInput.checked = true;

    showModal(true);
  };

  // --- 3. ЗБЕРЕЖЕННЯ (СТВОРЕННЯ АБО ОНОВЛЕННЯ) ---
  if (noteForm) {
    noteForm.onsubmit = async (e) => {
      e.preventDefault();

      const noteData = {
        title: document.getElementById("noteTitle").value,
        content: document.getElementById("noteContent").value,
        tag:
          document.querySelector('input[name="noteTag"]:checked')?.value ||
          "personal",
      };

      try {
        const method = editModeId ? "PUT" : "POST";
        const url = editModeId ? `${API_URL}/${editModeId}` : API_URL;

        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteData),
        });

        if (response.ok) {
          hideModal();
          fetchNotes();
        }
      } catch (err) {
        console.error("Помилка збереження:", err);
      }
    };
  }

  // --- 4. ВИДАЛЕННЯ ---
  window.deleteNote = async (id) => {
    if (!confirm("Видалити нотатку?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) fetchNotes();
    } catch (err) {
      console.error("Помилка видалення:", err);
    }
  };

  fetchNotes();
});
