const _API_KEY = "AZTXGPLxuoy7IakwATh39Q==oiY5UcNUl3wJ4CgB";

/* How many jokes to request from the API.  
   At the moment, we only care about receiving one (1) joke at a time. */
const _FETCH_LIMIT = 1;

/* You do not need to change this code below */
const _BASE_URL = `https://api.api-ninjas.com/v1/dadjokes?limit=${_FETCH_LIMIT}`;

/* Do not change this code below. */
const requestHeader = new Headers();
requestHeader.set("X-Api-Key", _API_KEY);
requestHeader.set("Content-Type", "application/json");

/**
 * A basic healthcheck function.
 * 
 * @returns {string} Only returns "pong"
 * @author Andrew Sheehan <asheehan@bu.edu>
 * @license "MIT"
 */
export function ping() {
    return "pong";
}

/**
 * Retrieves one random 'Dad' joke from api-ninjas.com.
 * 
 * <strong>Notes</strong>
 * <div>The _FETCH_LIMIT has to be set at one.   If you set it to anything else, it 
 *    will be ignored by the fetch() below.  (It's hard-coded to only look at [0].</div>
 *
 * @param {string} targetId The ID of an HTML element to place the joke.
 * @author Andrew Sheehan <asheehan@bu.edu>
 * @license "MIT"
 */
export function getDadJoke(targetId) {
    fetch(_BASE_URL, {
        url: _BASE_URL,
        headers: requestHeader
    }).then(response => {
         return response.json();
    }).then(data => {
        const joke = data[0].joke
        document.querySelector(`#${targetId}`).innerHTML = joke;

        const words = joke.split(' ');
        const wordCount = joke.length;
        const li = document.createElement('li');
        li.textContent = `The joke contains ${words.length} words and ${wordCount} characters.`;
        document.querySelector('#metrics').insertAdjacentHTML('beforeend', `<li>${li.textContent}</li>`);
    }).catch(error => {
        console.error(error.message);
    });
}

