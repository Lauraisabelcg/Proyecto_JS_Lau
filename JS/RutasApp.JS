let students = JSON.parse(localStorage.getItem('rsk_students')) || [];
let routeAssignments = JSON.parse(localStorage.getItem('rsk_route_assignments')) || {
    "1": [], "2": [], "3": [], "4": [], "5": [], "6": []
};

let activeDriverId = null; 
let presentsS = JSON.parse(localStorage.getItem('presents')) || {
    "1": [], "2": [], "3": [], "4": [], "5": [], "6": []
};
let abscentsS = JSON.parse(localStorage.getItem('abscents')) || {
    "1": [], "2": [], "3": [], "4": [], "5": [], "6": []
};

document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    initEventListeners();
    loadCurrentWeather(); 
    renderAllRoutes();    
});

let dom = {};
function initDOMReferences() {
    dom.modal = document.getElementById('assign-modal');
    dom.btnCloseModal = document.getElementById('btn-close-assign-modal');
    dom.btnCancelModal = document.getElementById('btn-cancel-assign');
    dom.searchInput = document.getElementById('route-student-search');
    dom.eligibleList = document.getElementById('eligible-students-list');
    dom.weatherData = document.getElementById('weather-data');
    dom.routeCards = document.querySelectorAll('.route-card');
}

function initEventListeners() {
    dom.btnCloseModal.addEventListener('click', () => closeModal());
    dom.btnCancelModal.addEventListener('click', () => closeModal());
    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) closeModal();
    });

    dom.searchInput.addEventListener('input', () => filterEligibleStudents());

    dom.routeCards.forEach(card => {
        const btn = card.querySelector('.btn-assign-student');
        const driverId = card.getAttribute('data-driver-id');
        
        if (btn && driverId) {
            btn.addEventListener('click', () => openModalForDriver(driverId));
        }
    });
}

async function loadCurrentWeather() {
    const lat = "7.1254";
    const lon = "-73.1198";
    
    const apiKey = "bd5e378503939ddaee76f12ad7a97608"; 
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Error de respuesta: ${response.status}`);
        
        const data = await response.json();
        
        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        
        let weatherEmoji = "☀️";
        if (iconCode.includes('09') || iconCode.includes('10')) weatherEmoji = "🌧️";
        else if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) weatherEmoji = "⛅";
        else if (iconCode.includes('11')) weatherEmoji = "⛈️";

        dom.weatherData.className = "weather-loaded";
        dom.weatherData.innerHTML = `<span>${weatherEmoji} <strong>${temp}°C</strong>, ${desc.charAt(0).toUpperCase() + desc.slice(1)}</span>`;
        
    } catch (error) {
        console.error("Error al conectar con OpenWeather:", error);
        
        dom.weatherData.className = "weather-error";
        dom.weatherData.innerHTML = `<span>⛅ <strong>26°C</strong>, Clima templado...</span>`;
    }
}

function openModalForDriver(driverId) {
    if (routeAssignments[driverId].length >= 15) {
        alert("⚠️ Operación rechazada: Este conductor ya alcanzó el cupo máximo permitido de 15 pasajeros asignados.");
        return;
    }

    activeDriverId = driverId;
    dom.modal.classList.remove('hidden');
    dom.searchInput.value = '';
    dom.searchInput.focus();
    renderEligibleStudents();
}

function closeModal() {
    dom.modal.classList.add('hidden');
    activeDriverId = null;
}

function renderEligibleStudents() {
    dom.eligibleList.innerHTML = '';
    
    const assignedIds = Object.values(routeAssignments).flat();

    const eligibleStudents = students.filter(st => !assignedIds.includes(st.id));

    if (eligibleStudents.length === 0) {
        dom.eligibleList.innerHTML = `<p class="empty-route-message" style="margin: 2rem auto;">No hay estudiantes disponibles para asignar. Todos ya tienen ruta o la base de datos está vacía.</p>`;
        return;
    }

    eligibleStudents.forEach(student => {
        const row = document.createElement('div');
        row.className = 'eligible-student-row';
        row.setAttribute('data-search-name', student.name.toLowerCase());
        row.setAttribute('data-search-code', student.code.toLowerCase());

        row.innerHTML = `
            <div class="eligible-student-info">
                <h4>${student.name}</h4>
                <p>Código: <strong>${student.code}</strong> | Grado: ${student.room}</p>
            </div>
            <button class="btn-select-student" data-student-id="${student.id}">Asignar</button>
        `;

        row.querySelector('.btn-select-student').addEventListener('click', () => {
            assignStudentToRoute(student.id);
        });

        dom.eligibleList.appendChild(row);
    });
}

function filterEligibleStudents() {
    const query = dom.searchInput.value.trim().toLowerCase();
    const rows = dom.eligibleList.querySelectorAll('.eligible-student-row');

    rows.forEach(row => {
        const name = row.getAttribute('data-search-name');
        const code = row.getAttribute('data-search-code');

        if (name.includes(query) || code.includes(query)) {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
        }
    });
}

function assignStudentToRoute(studentId) {
    if (!activeDriverId) return;

    routeAssignments[activeDriverId].push(studentId);
    
    saveRouteData();
    renderAllRoutes();
    closeModal();
}

function removeStudentFromRoute(driverId, studentId) {
    routeAssignments[driverId] = routeAssignments[driverId].filter(id => id !== studentId);
    
    saveRouteData();
    renderAllRoutes();
}

function saveRouteData() {
    localStorage.setItem('rsk_route_assignments', JSON.stringify(routeAssignments));
}

function renderAllRoutes() {
    dom.routeCards.forEach(card => {
        const driverId = card.getAttribute('data-driver-id');
        const listContainer = card.querySelector('.assigned-students-list');
        const counterSpan = card.querySelector('.capacity-counter');
        
        if (!driverId || !listContainer || !counterSpan) return;

        listContainer.innerHTML = '';

        const assignedIds = routeAssignments[driverId] || [];
        const currentCount = assignedIds.length;

        counterSpan.textContent = `${currentCount} / 15`;
        
        counterSpan.className = 'capacity-counter'; 
        if (currentCount === 0) {
            listContainer.innerHTML = `<p class="empty-route-message">Sin estudiantes asignados a este bus</p>`;
        } else if (currentCount === 15) {
            counterSpan.classList.add('is-full'); 
        } else {
            counterSpan.classList.add('has-students'); 
        }

        assignedIds.forEach(id => {
            const student = students.find(st => st.id === id);
            
            if (student) {
                const badge = document.createElement('div');
                badge.className = 'assigned-student-badge';
                badge.innerHTML = `
                    <div class="student-badge-text">
                        <span>👥<strong>${student.name}</strong></span><br>
                        <small>Cód: ${student.code} | Grado: ${student.room}</small>
                    </div>
                    <button class="btn-remove-from-route" title="Retirar de la ruta">&times;</button>
                    <button class="abscents" title="esta presente">&times;</button>
                    <button class="presents" title="esta presente">&times;</button> 
                `;

                badge.querySelector('.btn-remove-from-route').addEventListener('click', () => {
                    removeStudentFromRoute(driverId, id);
                });
                badge.querySelector('.abscents').addEventListener('click', () => {  
                

                    const counterStudents=document.querySelectorAll(".abscents")
                    counterStudents.length;
                    if (counterStudents>=0)saveAbsData()
                    
                });
                badge.querySelector('.presents').addEventListener('click', () => {
                    //removeStudentFromRoute(driverId, id);
                });
                listContainer.appendChild(badge);
            }
        });
    });

}
function saveAbsData() {
    localStorage.setItem('abscents', JSON.stringify(abscentsS));
}

