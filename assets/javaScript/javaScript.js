var loginButton = document.getElementById("loginButton")

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "77c956b588454e6881d164de033aee0a"
const clientSecret = "dfa342c53dc44bf5840b7743ba6ca04d"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
var url = ""
var authCode = ""
var searchButton = document.querySelector(".buttonDisplay");
var inputs = document.querySelector("#searchBarInput");
var criteria = '';
// Commented out this bug to help run script for cocktail API
// var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var track = document.querySelector("#track");
var artist = document.querySelector("#artist");
var plLength = Number(document.querySelector('#playlistLengthNumber').value);
var recommendations = '';

// var to target  the random cocktail btn 
var fetchCocktailButton = document.getElementById('fetch-cocktail-button');

// Random free cocktail API url 
// https://www.thecocktaildb.com/api/json/v1/1/random.php

function getRandomCocktailApi() {
  console.log("click")
  var requestUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';

  fetch(requestUrl)
    .then(function (response) {
      console.log(response.jsa)
      return response.json();
    })
    .then(function (data) {
      for (var i = 0; i < data.drinks.length; i++) {
        var cocktailName = document.createElement('h3');
        var glass = document.createElement("p");
        var instructions = document.createElement("p")

        var item = data.drinks[i]

        cocktailName.textContent = item.strDrink
        glass.textContent = item.strGlass
        instructions.textContent = item.strInstructions

        var cocktailContainer = document.getElementById("cocktailContainer");
        cocktailContainer.appendChild(cocktailName);
        cocktailContainer.appendChild(glass);
        cocktailContainer.appendChild(instructions);
      }
    });
}

// listener for the click on the get random cocktail btn 
fetchCocktailButton.addEventListener('click', getRandomCocktailApi);


function requestAccessToUserData() {
  url = authorise;
  url += "?client_id=" + clientID;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirectUri);
  url += "&show_dialog=True";
  url += "&scope=playlist-modify-public user-modify-playback-state playlist-modify-private user-library-read playlist-read-collaborative "
  return url;
};

loginButton.addEventListener("click", function (e) {
  e.preventDefault;
  window.location.href = requestAccessToUserData();
});

// minor change to below code so that it stores the code and triggers at refresh page. 
function getAndStoreUserCode() {
  var currentUrl = window.location.href;
  var newUrl = currentUrl.split("=");
  authCode = newUrl[1];
}
getAndStoreUserCode();

function tokenHandler(authCode) {
  var authUrl = "grant_type=authorization_code";
  authUrl += "&code=" + authCode;
  authUrl += "&redirect_uri" + encodeURI(redirectUri);
  authUrl += "&client_id=" + clientID;
  authUrl += "&client_secret=" + clientSecret;
}


// retrieves and sets the oAuthToken when function is triggered. 
function getToken() {
  var url = "https://accounts.spotify.com/api/token";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);

  xhr.setRequestHeader("Authorization", "Basic ODU5NDJlNWI0ZTU2NGUzMGIyMzIwNzRiZDViMTQxN2Q6N2YxMmVkOWMyMTI2NDlkZmFhNzAzODUyYTI4ZDU1MWM=");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      console.log(xhr.responseText);
      window.localStorage.setItem('oAuthToken', xhr.responseText);
    }
  };

  var data = "grant_type=client_credentials&code=" + authCode + "&redirect_uri=https%3A%2F%2Fchrisonions.github.io%2Fwebdevawesometeam%2F";

  xhr.send(data);


}


// SEARCH BOX LISTENER:
// when searchbox is clicked, it will save the entered text to local storage (so that it is persistent across screens)
// it will ask user to log in if they are not logged in
// if a valid search is there it will go to the results page and carry the authcode with it
// it then goes to search tracks function, which still isnt finished     

searchButton.addEventListener('click', function (e) {
  e.preventDefault();
  searchHandler();
})

function searchHandler() {
  if (inputs.value == '') {
    alert('enter a track name or artist name')
  } else {

    entry = inputs.value;
    window.localStorage.setItem('searchCriteria', entry);
    if (authCode == '') {
      requestAccessToUserData();
      return 'retry';
    }
    else {
      console.log('listener active')
      getToken();
      console.log('token got');
      getSeeds();
    }
  }
}

// updated to a working function to actually retrieve Track data
function getSeeds() {
  console.log("arrived at seed search");

  criteria = localStorage.getItem('searchCriteria');
  console.log(criteria + " is the basis for the search");
  //var name = JSON.parse(window.localStorage.getItem('searchCriteria'));

  var type = 'track'

  var url = "https://api.spotify.com/v1/search?q=" + criteria + "&type=" + type + "&limit=1";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);

  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + oAuthToken.access_token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      //console.log(xhr.responseText);
      window.localStorage.setItem('seeds', xhr.responseText);
    }
  };

  xhr.send();
  searchTracks();
}


function searchTracks() {
  console.log("arrived at get tracks");
  var seeds = JSON.parse(window.localStorage.getItem('seeds'));
  oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
  plLength = Number(document.querySelector('#playlistLengthNumber').value);

  var artist = seeds.tracks.items[0].artists[0].id
  var track = seeds.tracks.items[0].id
  var results = [];

  var url = "https://api.spotify.com/v1/recommendations?limit=" + plLength + "&market=AU&seed_artists=" + artist + "&seed_tracks=" + track + "&min_popularity=50";

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);

  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + oAuthToken.access_token);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log(xhr.status);
      //console.log(xhr.responseText);
      window.localStorage.setItem('recommendations', xhr.responseText);
    }
  };

  xhr.send();

  console.log("arrived at results generation");
  recommendations = JSON.parse(window.localStorage.getItem('recommendations'))
  for (let i = 0; i < plLength; i++) {
    results.push({ Artist: recommendations.tracks[i].artists[0].name, track: recommendations.tracks[i].name, Preview: recommendations.tracks[i].preview_url });
  }

  console.log("arrived at results display");
  console.log(results);

}


// RESULTS PAGE:

// ELEMENTS:
// -add refresh button
// -add playlist to spotify button.


// Function: 
// -when search button clicked
// -check input field for artist genre or songs
// -check playlist length

// Function: 
// -api call to twitter to crosscheck username to and get latest tweet
// -Store data

// Function: 
// -search database for 10 random songs related to input field
// Add the songs into a string for storage

// Function:
// -create dynamic display with results / tracks

// Function:
// -display songs
// -Display Twitter tweet



// -when click Add songs to playlist button
// -Calls API to add the playlist to customer account.

// -random button clicked

//variables to link to playlist length range/number input elements
var playlistLengthNumber = document.querySelector('#playlistLengthNumber');
var playlistLengthRange = document.querySelector('#playlistLengthRange');

//linking the password/character length range and input numbers
playlistLengthNumber.addEventListener('input', syncPlaylistLength);
playlistLengthRange.addEventListener('input', syncPlaylistLength);

function syncPlaylistLength(e) {
  const value = e.target.value
  playlistLengthNumber.value = value
  playlistLengthRange.value = value
}