let students = JSON.parse(localStorage.getItem('rsk_students')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initEventListeners();
    renderStudents();
});


