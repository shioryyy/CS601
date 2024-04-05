const cityToFull = {
    'LosAngeles': 'Los Angeles, CA, USA',
    'SaltLakeCity': 'Salt Lake City, UT, USA',
    'Houston': 'Houston, TX, USA',
    'Boston': 'Boston, MA, USA'
};
const zipToId = {
    '11111': 'LosAngeles',
    '22222': 'SaltLakeCity',
    '33333': 'Houston',
    '44444': 'Boston'
};
const cityToTimeZone = {
    'LosAngeles': 'America/Los_Angeles',
    'SaltLakeCity': 'America/Denver',
    'Houston': 'America/Chicago',
    'Boston': 'America/New_York'
};
let selectedCity;
function openModal(city) {
    selectedCity = city;
    const modal = document.getElementById('editDateTimeModal');
    modal.style.display = 'block';
    const display = document.getElementById('selectedTimeZoneDisplay');
    display.innerHTML = `<img src="USflag.png" alt="USA Flag" class="flag" /> ${cityToFull[city]}`;
}
function closeModal() {
    const modal = document.getElementById('editDateTimeModal');
    modal.style.display = 'none';
}
function saveDateTime() {
    const city = getSelectedCity();
    const { year, month, day, hour, minute } = getInputDateTime();
    const selectedCityDate = getCityDate(year, month, day, hour, minute, city);
    updateCitiesTime(city, selectedCityDate);
    closeModal();
}
function getSelectedCity() {
    return selectedCity;
}
function getTimeZoneForCity(city) {
    return cityToTimeZone[city];
}
function getInputDateTime() {
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const [hour, minute] = timeInput.value.split(':').map(Number);
    return { year, month, day, hour, minute };
}
function getCityDate(year, month, day, hour, minute, city) {
    const timeZone = getTimeZoneForCity(city);
    return new Date(new Date(year, month - 1, day, hour, minute).toLocaleString('en-US', { timeZone: timeZone }));
}
function updateCityTimeDisplay(city, date) {
    document.getElementById(city + 'Time').textContent = date.toString();
}
function updateCitiesTime(selectedCity, selectedCityDate) {
    Object.keys(cityToTimeZone).forEach(city => {
        if (city !== selectedCity) {
            const cityTimeZone = cityToTimeZone[city];
            displayTimeInTimeZone(selectedCityDate, cityTimeZone, city);
        }
        else if (city === selectedCity) {
            updateCityTimeDisplay(city, selectedCityDate);
        }
    });
}
function displayTimeInTimeZone(date, timeZone, elementId) {
    const formattedTime = convertToTimeZone(date, timeZone);
    console.log('timeZone', timeZone, 'date', date, 'formt', formattedTime);
    document.getElementById(elementId + 'Time').textContent = formattedTime;
}
function convertToTimeZone(date, timeZone) {
    return date.toLocaleString('en-US', { timeZone, hour: 'numeric', minute: 'numeric', hour12: true });
}
function updateDisplay(elementId, displayStyle, textContent) {
    const element = document.getElementById(elementId);
    element.style.display = displayStyle;
    if (textContent) {
        element.textContent = textContent;
    }
}
function setupEventListeners() {
    const closeButton = document.querySelector('.close');
    const saveButton = document.getElementById('saveDateTime');
    const searchButton = document.getElementById('searchButton');
    closeButton.addEventListener('click', closeModal);
    saveButton.addEventListener('click', saveDateTime);
    searchButton.addEventListener('click', filterCities);
}
function filterCities() {
    const zipCode = document.getElementById('searchInput').value;
    const city = zipToId[zipCode];
    document.getElementById(city).classList.remove('hidden');
}
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    const contextMenu = document.createElement('ul');
    contextMenu.style.position = 'absolute';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.classList.add('context-menu');
    const deleteOption = document.createElement('li');
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', function () {
        const city = event.target.closest('.timezone-info').id;
        document.getElementById(city).classList.add('hidden');
        document.body.removeChild(contextMenu);
    });
    contextMenu.appendChild(deleteOption);
    document.body.appendChild(contextMenu);
});
document.addEventListener('click', function () {
    const contextMenu = document.querySelector('.context-menu');
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }
});
setupEventListeners();
