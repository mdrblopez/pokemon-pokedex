const pokemonList = document.getElementById("pokemonList");
const searchPokemon = document.getElementById("searchPokemon");
const reload = document.getElementById("loadMore");
const search = document.getElementById("search");
const pokemonDiv = document.querySelectorAll(".pokemonOne");
const msgDisplay = document.getElementById("messageDisplay");
const searchBox = document.getElementById("searchBox");

// Global Variables
const limit = 12; // To set the default number of pokemon to display
let offset = 0;
let hide = 0;
let searchCounter = 0;
let resultList = [];
let pokemonType = [];
let namePokemon = "";
let allDetails = [];
let allTypeLoaded = [];
let checkMessageDisplay = 0;

// Map for different types of pokemon (background color)
let color1st = "white";
let color2nd = "white";
const typeColorMap = new Map([
  ["Grass", "background-color: #9bcc50"],
  ["Fire", "background-color: #fd7d24"],
  ["Fighting", "background-color: #fd7d24"],
  ["Water", "background-color: #4592c4"],
  ["Electric", "background-color: #eed535"],
  ["Bug", "background-color: #729f3f"],
  ["Flying", "background: linear-gradient(180deg, #3dc7ef 50%, #bdb9b8 50%);"],
  ["Ice", "background-color: #3dc7ef"],
  ["Normal", "background-color: #a4acaf"],
  ["Poison", "background-color: #b97fc9"],
  ["Ghost", "background-color: #7b62a3"],
  ["Ground", "background: linear-gradient(180deg, #f7de3f 50%, #ab9842 50%);"],
  ["Fairy", "background-color: #f366b9"],
  ["Psychic", "background-color: #f366b9"],
  ["Steel", "background-color: #9eb7b8"],
  ["Rock", "background-color: #a38c21"],
  ["Dragon", "background: linear-gradient(180deg, #53a4cf 50%, #f16e57 50%);"],
  ["", "background-color: white"],
]);

// To fetch the pokemon list from apiURL
async function getPokemon() {
  try {
    let apiURL = `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`;

    const response = await fetch(apiURL);
    const itemList = await response.json();
    resultList = itemList.results.map((item) => item);
    offset = offset + limit;
    console.log(resultList);
    displayPokemon();
  } catch (error) {
    // catch error
  }
}

// The fetch the pokemond details
async function displayPokemon() {
  // Map method will create a new array (promises) to save all individual detail
  const promises = resultList.map(async (item) => {
    const response = await fetch(item.url);
    const details = response.json();
    return details;
  });
  // to save all the pokemon details in an array
  const batchDetails = [];
  batchDetails.push(...(await Promise.all(promises)));
  allDetails.push(...batchDetails);

  // to individually evaluate the pokemon detail
  for (const eachDetail of batchDetails) {
    displayPokemonDetails(eachDetail);
  }
}

// To display/append the pokemon list
function displayPokemonDetails(pokemonDetails) {
  // to Uppercase the first letter of the name
  const nameCorrected = capitalizeLetter(pokemonDetails.species.name);
  pokemonType = pokemonDetails.types;
  // to use forEach looping to get the pokemon type
  let i = pokemonDetails.types.length - 1;
  let pokemonFirstType = "";
  let pokemonSecondType = "";
  pokemonType.forEach((type) => {
    const pokemonType = type.type.name;
    const pokemonTypeDisplay = capitalizeLetter(type.type.name);
    // the pokemon type and its details are to be saved in allTypeLoaded array
    if (pokemonDetails.types.length == 1) {
      pokemonFirstType = pokemonTypeDisplay;
      allTypeLoaded.push({
        name: pokemonType,
        detail: pokemonDetails,
      });
    } else if (i) {
      pokemonFirstType = pokemonTypeDisplay;
      allTypeLoaded.push({
        name: pokemonType,
        detail: pokemonDetails,
      });
      i--;
    } else {
      pokemonSecondType = pokemonTypeDisplay;
      allTypeLoaded.push({
        name: pokemonType,
        detail: pokemonDetails,
      });
    }
    console.log(allTypeLoaded);
  });

  // choosing background color according to its type
  if (typeColorMap.has(pokemonFirstType)) {
    color1st = typeColorMap.get(pokemonFirstType);
  }
  if (typeColorMap.has(pokemonSecondType)) {
    color2nd = typeColorMap.get(pokemonSecondType);
  }
  // To add elements in the HTML to display the pokemon details
  if (hide == 0) {
    const html = `
        <div class="pokemonOne" id ="pokemonOne">
            <img src = ${pokemonDetails.sprites.other["official-artwork"].front_default} alt = ${nameCorrected} title = ${nameCorrected}> 
            <p id="itemNumber">#000${pokemonDetails.id}</p>
            <p id="itemName">${nameCorrected}</p>
            <button id="typeOne" style="${color1st};"> ${pokemonFirstType}</button>
            <button id="typeTwo" style="${color2nd};"> ${pokemonSecondType}</button>
        </div>`;
    pokemonList.insertAdjacentHTML("beforeend", html);
  } else {
    const html = `
        <div class="searchDisplay" id ="searchDisplay">
            <img src = ${pokemonDetails.sprites.other["official-artwork"].front_default} alt = ${nameCorrected} title = ${nameCorrected}> 
            <p id="itemNumber">#000${pokemonDetails.id}</p>
            <p id="itemName">${nameCorrected}</p>
            <button id="typeOne" style="${color1st};"> ${pokemonFirstType}</button>
            <button id="typeTwo" style="${color2nd};"> ${pokemonSecondType}</button>
        </div>`;
    hideListAndShowSearchDisplay();
    searchPokemon.insertAdjacentHTML("beforeend", html);
    searchCounter++;
  }
}

// A function to capitalize the first Letter
function capitalizeLetter(nameToCorrect) {
  const nameFirstLetter = nameToCorrect.charAt(0).toUpperCase();
  const remainingLetters = nameToCorrect.substring(1);
  return nameFirstLetter + remainingLetters;
}

// creating <p> element for search display message
function messageDisplay(msg) {
  const searchMessage = document.createElement("p");
  searchMessage.innerText = msg;
  searchMessage.setAttribute("id", "messageDisplay");
  pokemonList.style.display = "none";
  document.body.appendChild(searchMessage);
  checkMessageDisplay = 1;
}

//---- Search for pokemon name/typre - SEARCH BUTTON---
search.addEventListener("click", () => {
  let searchText = searchBox.value.toLowerCase();
  console.log(searchText);

  if (hide == 1 && searchText == "") {
    console.log("im here");
    showListAndRemoveSearchDisplay();
    messageDisplay(
      "We could not find any matches. Double check your search for any typos or spelling errors - or try a different search term."
    );
    hide = 1;
  }

  // check the pokemonList if the search name exist
  allDetails.forEach((individualDetail) => {
    if (
      individualDetail.species.name.includes(searchText) &&
      searchText !== ""
    ) {
      hide = 1;
      // Call getPokemonType function to create elements for seach item
      displayPokemonDetails(individualDetail);
    }
  });
  // check the pokemon TYPE if the search type exist
  console.log(allTypeLoaded);
  if (hide == 0 && searchText !== "") {
    allTypeLoaded.forEach((eachType) => {
      if (eachType.name.includes(searchText) && searchText !== "") {
        hide = 1;
        // Call displayPokemonDetails function to create elements for seach item
        displayPokemonDetails(eachType.detail);
      }
    });
  }

  // if(hide == 0 && searchText !== "")
  if (hide == 0 && searchText !== "") {
    messageDisplay(
      "We could not find any matches. Double check your search for any typos or spelling errors - or try a different search term."
    );
    hide = 1;
  }
  searchBox.value = "";
});

//---- Load for more Pokemon Button - LOAD MORE POKEMON BUTTON---
reload.addEventListener("click", () => {
  if (hide) {
    showListAndRemoveSearchDisplay();
  } else {
    // Load more Pokemon
    getPokemon();
  }
});

// To hide PokemonList() and display the searchPokemon
function hideListAndShowSearchDisplay() {
  pokemonList.style.display = "none";
  searchPokemon.style.display = "inline-grid";
}
//Remove the search pokemon div or message and display the Pokemon list
function showListAndRemoveSearchDisplay() {
  pokemonList.style.display = "inline-grid";
  console.log(searchCounter);

  for (let i = 0; i < searchCounter; i++) {
    const div = document.getElementById("searchDisplay");
    div.remove();
  }
  searchCounter = 0;
  if (checkMessageDisplay == 1) {
    const msgID = document.getElementById("messageDisplay");
    msgID.remove();
  }
  // reset hide and chechMessageDisplay to 0
  hide = 0;
  checkMessageDisplay = 0;
  searchBox.value = "";
}

getPokemon();
