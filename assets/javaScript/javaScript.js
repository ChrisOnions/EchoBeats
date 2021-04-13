var loginButton = document.querySelector("#loginButton");
var searchButton = document.querySelector("#searchButton");
var randomButton = document.querySelector("#randomButton");
var inputs = document.querySelector("#searchBarInput");
var fetchCocktailButton = document.getElementById('fetch-cocktail-button');
var track = document.querySelector("#track");
var artist = document.querySelector("#artist");
var modalTokenError = document.querySelector(".modal");
var modalClose = document.querySelector("#close");
var modalLogin = document.querySelector('#modal-login-button');
var modalCloseTag = document.querySelector('#close');
var modalCloseButton = document.querySelector('#modal-close-button');
var noInput = document.querySelector("#no-input");
var badInput = document.querySelector("#bad-input");

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "85942e5b4e564e30b232074bd5b1417d"
const clientSecret = "7f12ed9c212649dfaa703852a28d551c"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
const randomGenre = ["POP", "HIPHOP", "HIP HOP", "HIP-HOP", "ROCK", "INDIE", "DANCE", "ELECTRONIC", "MOOD", "ALTERNATIVE", "COUNTRY", "JAZZ", "BLUES", "CHILL", "WORKOUT", "RNB", "R&B"]

var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var url = '';
var authCode = '';

// ***NOTE - There are 2 seperate JS files, this one is for landing page - results.js is for results page

// ----------------------------AUTHENTICATION FLOW------------------------------//
// Auth flow makes sure user has a valid token when they arrive at the page. It detects and handles authentication problems

// Directs user to login with their spotify credentials as required
function requestAccessToUserData() {
  url = authorise;
  url += "?client_id=" + clientID;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirectUri);
  url += "&show_dialog=True";
  url += "&scope=playlist-modify-public user-follow-modify user-modify-playback-state playlist-modify-private user-library-read playlist-read-collaborative user-read-private"
  return url;
};

// Login button listener
loginButton.addEventListener("click", function (e) {
  e.preventDefault();
  window.location.href = requestAccessToUserData();
});

// Captures user's login token so it can be used to obtain an oAuth token. 
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

//Handlers for the POP UP which appears if user NOT LOGGED IN or token refresh fails

modalLogin.onclick = function (e) {
  e.preventDefault();  //fixed missing brackets
  window.location.href = requestAccessToUserData();
}
modalCloseButton.onclick = function () {
  modalTokenError.style.display = "none";
}
modalCloseTag.onclick = function () {
  modalTokenError.style.display = "none";
}

// ===== CHECK for VALID TOKEN ====//
// This runs at the page load or refresh to test token (if it exists) and get a new one if it doesnt. 
//If refreshToken request fails, the refreshToken function will delete the old token and direct them down the login path to retrieve a new one.

function tokenValidation() {
  try {         // lets see if there is a token from a previous login in local storage
    let tokenCheck = oAuthToken.access_token;
    refreshToken();
  }
  catch (error) {    // if there is no then lets check if they are logged in, if no, ask for log in, if yes, then exchange authcode for token
    var loggedIn = (authCode == undefined || authCode == null || authCode == "") ?
      (console.log('arrived at bad authcode - LOG IN'), modalTokenError.style.display = 'block') :
      (console.log('authcode exists - exchanging authcode for token'), getToken()); // get them a token if they logged in
  }
}
tokenValidation()

// ========= GET oAUTH TOKEN =========//
// This is called whenever a missing or invalid token is detected

function getToken() {
  fetch("https://accounts.spotify.com/api/token", {
    body: "grant_type=authorization_code&code=" + authCode + "&redirect_uri=https%3A%2F%2Fchrisonions.github.io%2Fwebdevawesometeam%2F",
    headers: {
      Authorization: "Basic ODU5NDJlNWI0ZTU2NGUzMGIyMzIwNzRiZDViMTQxN2Q6N2YxMmVkOWMyMTI2NDlkZmFhNzAzODUyYTI4ZDU1MWM=",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        console.log(response);
        return response.json();
      }
      else {
        modalTokenError.style.display = 'block' // if token call fails lets log them in again, which will return them to tokenValidation function which should pass a valid auth code after log in. 
        throw Error('getToken failed - bad Auth code - please log in');
      }
    })
    .then(function (data) {
      console.log(data)
      localStorage.setItem('oAuthToken', JSON.stringify(data));
      localStorage.setItem('token', JSON.stringify(data));
      window.location.reload();
    })
    .catch((error) => {

      console.log(error);
    })
}

// refreshes token if it expires - saves user needing to login AGAIN every visit or every 60 mins 
function refreshToken() {
  fetch("https://accounts.spotify.com/api/token", {
    body: "grant_type=refresh_token&refresh_token=" + oAuthToken.refresh_token,
    headers: {
      Authorization: "Basic ODU5NDJlNWI0ZTU2NGUzMGIyMzIwNzRiZDViMTQxN2Q6N2YxMmVkOWMyMTI2NDlkZmFhNzAzODUyYTI4ZDU1MWM=",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then(function (response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json()
    } else {
      console.log('refresh failed, get new token');
      localStorage.removeItem('oAuthToken'); //if refresh fails then delete oAuthToken which will send them down the login/getToken path
      requestAccessToUserData();
    }
  })
    .then(function (data) {
      localStorage.setItem('token', JSON.stringify(data))
      window.location.reload();
    })
    .catch((error) => {
      console.log(error);
    })
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
randomButton.addEventListener("click", function (r) {
  r.preventDefault();
  inputs.value = randomGenre[Math.floor(Math.random() * randomGenre.length)];
  searchHandler();
})

// removes the 'no input' error which gets thrown if user tries an empty search when user types into search field
inputs.addEventListener('keydown', function () {
  noInput.style.display = "none";
  badInput.style.display = "none";
})

// ======= Validates the user's search and acts accordingly ==========//
function searchHandler() {
  if (inputs.value == '') {
    noInput.style.display = "block";
    return;
  }
  for (let i = 0; i < inputs.value.length; i++) {
    if ("!@#$%^&*()<>,./?:;][{}_-+=~`\|".includes(inputs.value[i])) {
      badInput.style.display = 'block';
      return;
    }
  }
  getSeeds(inputs.value);
}

// Takes the users search criteria and gets metadata, to be used to generate recommendations - requires oAuth token 
// does a quick token format validation before running
// if the response to track search contains no track data, then the user will see a message to inform their search is bad 
function getSeeds(searchCriteria) {
  try {
    var accessToken = JSON.parse(localStorage.getItem('token')).access_token;
    var url = "https://api.spotify.com/v1/search?q=" + searchCriteria + "&type=track&limit=1";
    var playlistLength = Number(document.querySelector('#playlistLengthNumber').value);

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken
      }
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      else {
        throw new Error(response.statusText);
      }
    })
      .then(function (data) {
        var artist = data.tracks.items[0].artists[0].id
        var track = data.tracks.items[0].id
        var url2 = "https://api.spotify.com/v1/recommendations?limit=" + playlistLength + "&market=AU&seed_artists=" + artist + "&seed_tracks=" + track + "&min_popularity=50";
        fetch(url2, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + accessToken
          }
        }).then(function (response) {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          }
          else {
            console.log('ERROR');
            throw Error(response.statusText);
          }
        }).then(function (data) {
          localStorage.setItem('recommendations', JSON.stringify(data))
        }).then(function () {
          window.location.href = "https://chrisonions.github.io/webdevawesometeam/results"
        })
      }).catch((error) => {  //this catch will assume that non-ok responses are due to bad token and will refresh it.
        refreshToken();
      })
  }
  catch (e) {
    modalTokenError.style.display = 'block';
  }
}

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