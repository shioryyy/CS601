// Import language module
import { languages } from './languages.js';

document.addEventListener('DOMContentLoaded', function() {
    const fahrenheitInput = document.getElementById('fahrenheitInput');
    const convertBtn = document.getElementById('convertBtn');
    const result = document.getElementById('result');
    const languageSelect = document.getElementById('languageSelect');
    const title = document.getElementById('title');

    function convertTemperature() {
        const fahrenheit = fahrenheitInput.value;
        if (fahrenheit === '' || isNaN(fahrenheit) || fahrenheit < -250 || fahrenheit > 250) {
            result.textContent = languages[languageSelect.value].error;
            return;
        }
        const celsius = ((fahrenheit - 32) * 5/9).toFixed(2);
        result.textContent = `${fahrenheit}°F is ${celsius}°C.`;
    }

    function updateLanguage() {
        title.textContent = languages[languageSelect.value].title;
        fahrenheitInput.placeholder = languages[languageSelect.value].inputPlaceholder;
        convertBtn.textContent = languages[languageSelect.value].convertButton;
        result.textContent = '';
    }

    convertBtn.addEventListener('click', convertTemperature);
    languageSelect.addEventListener('change', updateLanguage);

    updateLanguage();
});
