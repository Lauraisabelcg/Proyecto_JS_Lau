let students = JSON.parse(localStorage.getItem('rsk_students')) || [];
let isEditing = false;
let editStudentId = null;

document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initEventListeners();
    renderStudents();
});

let dom = {};
function initDOMReferences() {
    dom.modal = document.getElementById('student-modal');
    dom.form = document.getElementById('student-form');
    dom.btnOpenModal = document.getElementById('btn-open-modal');
    dom.btnCloseModal = document.getElementById('btn-close-modal');
    dom.btnCancelForm = document.getElementById('btn-cancel-form');
    dom.studentsGrid = document.getElementById('students-grid');
    dom.searchInput = document.getElementById('student-search');
    dom.modalTitle = document.getElementById('modal-title');
    
    dom.inputName = document.getElementById('student-name');
    dom.inputRoom = document.getElementById('student-room');
    dom.inputCode = document.getElementById('student-code');
    dom.inputPhone = document.getElementById('student-phone');
}

function initEventListeners() {
    dom.btnOpenModal.addEventListener('click', () => openModal());
    dom.btnCloseModal.addEventListener('click', () => closeModal());
    dom.btnCancelForm.addEventListener('click', () => closeModal());
    
    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) closeModal();
    });

    dom.form.addEventListener('submit', (e) => handleFormSubmit(e));

    dom.searchInput.addEventListener('input', () => filterStudents());
}

function openModal(student = null) {
    dom.modal.classList.remove('hidden');
    dom.inputName.focus();

    if (student) {
        isEditing = true;
        editStudentId = student.id;
        dom.modalTitle.textContent = 'Editar Perfil del Estudiante';
        
        dom.inputName.value = student.name;
        dom.inputRoom.value = student.room;
        dom.inputCode.value = student.code;
        dom.inputPhone.value = student.phone;
        
        dom.inputCode.disabled = true; 
    } else {
        isEditing = false;
        editStudentId = null;
        dom.modalTitle.textContent = 'Registrar Nuevo Estudiante';
        dom.form.reset();
        dom.inputCode.disabled = false;
    }
}

function closeModal() {
    dom.modal.classList.add('hidden');
    dom.form.reset();
    isEditing = false;
    editStudentId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const name = dom.inputName.value.trim();
    const room = dom.inputRoom.value.trim();
    const code = dom.inputCode.value.trim();
    const phone = dom.inputPhone.value.trim();

    if (!name || !room || !code || !phone) {
        alert('Por favor, completa todas las casillas del formulario.');
        return;
    }

    if (isEditing) {
        students = students.map(student => {
            if (student.id === editStudentId) {
                return { ...student, name, room, phone };
            }
            return student;
        });
    } else {
        const codeExists = students.some(st => st.code.toLowerCase() === code.toLowerCase());
        if (codeExists) {
            alert('Error: Ya existe un estudiante registrado con este código estudiantil.');
            return;
        }

        const newStudent = {
            id: Date.now().toString(),
            name,
            room,
            code,
            phone
        };
        students.push(newStudent);
    }

    saveToLocalStorage();
    renderStudents();
    closeModal();
}

function deleteStudent(id) {
    const student = students.find(st => st.id === id);
    if (!student) return;

    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el perfil del estudiante ${student.name} (Código: ${student.code})?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmDelete) {
        students = students.filter(st => st.id !== id);
        saveToLocalStorage();
        renderStudents();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('rsk_students', JSON.stringify(students));
}

function renderStudents() {
    dom.studentsGrid.innerHTML = '';

    if (students.length === 0) {
        dom.studentsGrid.innerHTML = `
            <p class="no-data-message">No hay estudiantes registrados en el sistema. ¡Haz clic en "Agregar estudiante" para comenzar!</p>
        `;
        return;
    }

    students.forEach(student => {
        const article = document.createElement('article');
        article.className = 'student-card';
        article.setAttribute('data-student-id', student.id);
        
        article.setAttribute('data-search-name', student.name.toLowerCase());
        article.setAttribute('data-search-code', student.code.toLowerCase());

        article.innerHTML = `
            <div class="student-data">
                <h3>${student.name}</h3>
                <p><strong>Código:</strong> ${student.code}</p>
                <p><strong>Salón / Grado:</strong> ${student.room}</p>
                <p><strong>Contacto Acudiente:</strong> ${student.phone}</p>
            </div>
            <div class="student-actions">
                <button class="btn-card-edit">Editar estudiante</button>
                <button class="btn-card-delete">Eliminar perfil del estudiante</button>
            </div>
        `;

        article.querySelector('.btn-card-edit').addEventListener('click', () => openModal(student));
        article.querySelector('.btn-card-delete').addEventListener('click', () => deleteStudent(student.id));

        dom.studentsGrid.appendChild(article);
    });

    filterStudents();
}

function filterStudents() {
    const query = dom.searchInput.value.trim().toLowerCase();
    const cards = dom.studentsGrid.querySelectorAll('.student-card');
    let visibleCardsCount = 0;

    cards.forEach(card => {
        const nameData = card.getAttribute('data-search-name');
        const codeData = card.getAttribute('data-search-code');

        if (nameData.includes(query) || codeData.includes(query)) {
            card.style.display = '';
            visibleCardsCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const oldMessage = document.getElementById('search-no-results');
    if (oldMessage) oldMessage.remove();

    if (visibleCardsCount === 0 && students.length > 0) {
        const noResultsPara = document.createElement('p');
        noResultsPara.id = 'search-no-results';
        noResultsPara.className = 'no-data-message';
        noResultsPara.textContent = `No se encontraron estudiantes que coincidan con la búsqueda: "${dom.searchInput.value}"`;
        dom.studentsGrid.appendChild(noResultsPara);
    }
}