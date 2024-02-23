const recipes = new Map();

window.onload = function() {
  localStorage.clear();
  loadRecipes();
};

function initializeRecipe() {
  if (!recipes.has("currentRecipe")) {
    recipes.set("currentRecipe", { steps: [] });
  }
}

function addStep() {
  initializeRecipe();

  const stepInput = document.getElementById("step-input");
  if (stepInput.value.trim() !== "") {
    const currentSteps = recipes.get("currentRecipe").steps;
    currentSteps.push(stepInput.value);
    recipes.get("currentRecipe").steps = currentSteps;
    updateStepsUI();
    stepInput.value = "";
  }
}

function displayRecipe(recipe, key) {
  const div = document.getElementById("recipes-list");

  div.innerHTML += `
    <div data-key="${key}">
      <h3>${recipe.title} <button class="edit-title btn btn-primary">Edit title</button></h3>
      <img src="${recipe.imageUrl}" alt="${recipe.title}">
      <p>${recipe.description} <button class="edit-description btn btn-primary">Edit description</button></p>
      <ul>
      ${recipe.steps.map((step, index) => `
        <li>
          ${step}
          <button class="edit-step btn btn-primary" data-index="${index}">edit</button>
          <button class="delete-step btn btn-primary" data-index="${index}">delete</button>
        </li>
      `).join('')}
    </ul>
      <button class="delete-recipe btn btn-primary">Delete recipe</button>
    </div>
  `;
}

function saveRecipe() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const imageUrl = document.getElementById("image-url").value;
  
    if (title && description) {
      const currentRecipe = recipes.get("currentRecipe");
      if (currentRecipe && currentRecipe.steps.length > 0) {
        const recipe = {
          title,
          description,
          steps: currentRecipe.steps,
          imageUrl,
        };
        localStorage.setItem(recipe.title, JSON.stringify(recipe));
        recipes.set(recipe.title, recipe);
    
        displayRecipe(recipe, recipe.title);
    
        alert("Recipe saved!");
      } else {
        alert("Please add at least one step.");
      }
    } else {
      alert("Please complete all fields.");
    }
  }

function loadRecipes() {
  const div = document.getElementById("recipes-list");
  div.innerHTML = ""; 
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const recipe = JSON.parse(localStorage.getItem(key));
    displayRecipe(recipe, key); 
  }
}

function updateStepsUI() {
  const stepsList = document.getElementById('steps-list');
  stepsList.innerHTML = '';
  const currentSteps = recipes.get('currentRecipe').steps;
  currentSteps.forEach((step, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${step}
      <button class="edit-step btn btn-primary" data-index="${index}">Edit</button>
      <button class="delete-step btn btn-primary" data-index="${index}">Delete</button>
    `;
    stepsList.appendChild(li);
    li.querySelector('.edit-step').addEventListener('click', function() {
      console.log('edit step');
      const newStep = prompt("Edit step:", step);
      if (newStep) {
        currentSteps[index] = newStep;
        localStorage.setItem('currentRecipe', JSON.stringify(recipes.get('currentRecipe')));
        updateStepsUI();
      }
    });
    li.querySelector('.delete-step').addEventListener('click', function() {
      console.log('delete step');
      if (confirm('Sure you want to delete this step')) {
        currentSteps.splice(index, 1);
        localStorage.setItem('currentRecipe', JSON.stringify(recipes.get('currentRecipe')));
        updateStepsUI();
      }
    });
  });
}

document.addEventListener('click', function(event) {
    const target = event.target;
    const recipeElement = target.closest('[data-key]');
    if (!recipeElement) return;
    const key = recipeElement.dataset.key;
    console.log(key);
    const recipe = JSON.parse(localStorage.getItem(key));
  
    if (!recipe) {
      console.error(`No recipe found for key "${key}"`);
      return;
    }
  
    if (target.classList.contains('edit-title')) {
      const newTitle = prompt("Edit title", recipe.title);
      if (newTitle) {
        localStorage.removeItem(key);
        recipe.title = newTitle;
        localStorage.setItem(newTitle, JSON.stringify(recipe));
        loadRecipes();
      }
    } else if (target.classList.contains('edit-description')) {
      const newDescription = prompt("Edit description:", recipe.description);
      if (newDescription) {
        recipe.description = newDescription;
        localStorage.setItem(key, JSON.stringify(recipe));
        loadRecipes();
      }
    } else if (target.classList.contains('delete-recipe')) {
      if (confirm('Sure you want to delete this recipe?')) {
        localStorage.removeItem(key);
        loadRecipes();
      }
    } else if (target.classList.contains('edit-step')) {
      console.log('edit step');
      const index = target.dataset.index;
      if (recipe.steps && index < recipe.steps.length) {
        const newStep = prompt("Edit step:", recipe.steps[index]);
        if (newStep) {
          recipe.steps[index] = newStep;
          localStorage.setItem(key, JSON.stringify(recipe));
          updateStepsUI();
          loadRecipes();
        }
      }
    } else if (target.classList.contains('delete-step')) {
      if (confirm('Sure you want to delete this step?')) {
        const index = target.dataset.index;
        if (recipe.steps && index < recipe.steps.length) {
          recipe.steps.splice(index, 1);
          localStorage.setItem(key, JSON.stringify(recipe));
          updateStepsUI();
          loadRecipes();
        }
      }
    }
  });