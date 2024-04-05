interface TimeZoneInfo {
    city: string;
    timeZone: string;
}

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

let selectedCity: string;
function openModal(city: string): void {
    selectedCity = city;
    const modal = document.getElementById('editDateTimeModal') as HTMLDivElement;
    modal.style.display = 'block';
    const display = document.getElementById('selectedTimeZoneDisplay') as HTMLDivElement;
    display.innerHTML = `<img src="USflag.png" alt="USA Flag" class="flag" /> ${cityToFull[city]}`;
}

function closeModal(): void {
    const modal = document.getElementById('editDateTimeModal') as HTMLDivElement;
    modal.style.display = 'none';
}

function saveDateTime(): void {
    const city = getSelectedCity();
    const { year, month, day, hour, minute } = getInputDateTime();
    const selectedCityDate = getCityDate(year, month, day, hour, minute, city);
    updateCitiesTime(city, selectedCityDate);
    closeModal();
}

function getSelectedCity(): string {
    return selectedCity;
}

function getTimeZoneForCity(city: string): string {
    return cityToTimeZone[city];
}

function getInputDateTime() {
    const dateInput = document.getElementById('dateInput') as HTMLInputElement;
    const timeInput = document.getElementById('timeInput') as HTMLInputElement;
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const [hour, minute] = timeInput.value.split(':').map(Number);
    return { year, month, day, hour, minute };
}

function getCityDate(year: number, month: number, day: number, hour: number, minute: number, city: string): Date {
    const timeZone = getTimeZoneForCity(city);
    return new Date(new Date(year, month - 1, day, hour, minute).toLocaleString('en-US', { timeZone: timeZone }));
}


function updateCityTimeDisplay(city: string, date: Date): void {
    document.getElementById(city + 'Time').textContent = date.toString();
}

function updateCitiesTime(selectedCity: string, selectedCityDate: Date): void {
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


function displayTimeInTimeZone(date: Date, timeZone: string, elementId: string): void {
    const formattedTime = convertToTimeZone(date, timeZone);
    console.log('timeZone',timeZone ,'date',date,'formt',formattedTime);
    document.getElementById(elementId + 'Time').textContent = formattedTime;
}

function convertToTimeZone(date: Date, timeZone: string): string {
    return date.toLocaleString('en-US', { timeZone, hour: 'numeric', minute: 'numeric', hour12: true });
}

function updateDisplay(elementId: string, displayStyle: string, textContent?: string): void {
    const element = document.getElementById(elementId) as HTMLDivElement;
    element.style.display = displayStyle;
    if (textContent) {
        element.textContent = textContent;
    }
}

function setupEventListeners(): void {
    const closeButton = document.querySelector('.close') as HTMLElement;
    const saveButton = document.getElementById('saveDateTime') as HTMLElement;
    const searchButton = document.getElementById('searchButton') as HTMLInputElement;

    closeButton.addEventListener('click', closeModal);
    saveButton.addEventListener('click', saveDateTime);
    searchButton.addEventListener('click', filterCities);
}

function filterCities(this: HTMLInputElement): void {
    const zipCode = (document.getElementById('searchInput') as HTMLInputElement).value;
    const city = zipToId[zipCode];
    document.getElementById(city).classList.remove('hidden');
}

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  
    const contextMenu = document.createElement('ul');
    contextMenu.style.position = 'absolute';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.classList.add('context-menu');
  
    const deleteOption = document.createElement('li');
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', function() {
      const city = (event.target as Element).closest('.timezone-info').id;
      document.getElementById(city).classList.add('hidden');
      document.body.removeChild(contextMenu);
    });
  
    contextMenu.appendChild(deleteOption);
  
    document.body.appendChild(contextMenu);
  });
  
  document.addEventListener('click', function() {
    const contextMenu = document.querySelector('.context-menu');
    if (contextMenu) {
      document.body.removeChild(contextMenu);
    }
  });

setupEventListeners();
