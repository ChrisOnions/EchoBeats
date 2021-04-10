var loginButton = document.getElementById("loginButton")
var searchButton = document.querySelector(".buttonDisplay");
var inputs = document.querySelector("#searchBarInput");
var modal = document.getElementById("errorModal");
var closeModle = document.getElementById("close");
var modalInputFiled = document.getElementById("modalInputFiled");
var modalSearchButton = document.getElementById("modalSearchButton")
var randomButton = document.getElementById("randomButton");

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "85942e5b4e564e30b232074bd5b1417d"
const clientSecret = "7f12ed9c212649dfaa703852a28d551c"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
var url = ""
var authCode = ""
var criteria = '';
var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var track = document.querySelector("#track");
var artist = document.querySelector("#artist");
var plLength = Number(document.querySelector('#playlistLengthNumber').value);
var recommendations = '';
var randomGenre = ["POP", "HIPHOP", "HIP HOP", "HIP-HOP", "ROCK", "INDIE", "DANCE", "ELECTRONIC", "MOOD", "ALTERNATIVE", "COUNTRY", "JAZZ", "BLUES", "CHILL", "WORKOUT", "RNB", "R&B"]

function requestAccessToUserData() {
  url = authorise;
  url += "?client_id=" + clientID;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirectUri);
  url += "&show_dialog=True";
  url += "&scope=playlist-modify-public user-follow-modify user-modify-playback-state playlist-modify-private user-library-read playlist-read-collaborative user-read-private"
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


// *Updated - now detects missing login, forces refresh after getting TOKEN. ----Retrieves and sets the oAuthToken when function is triggered. 

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
        return response.json();
      }
      else {
        throw Error(response.statusText);
      }
    })
    .then(function (data) {
      console.log(data)
      localStorage.setItem('oAuthToken', JSON.stringify(data))
      window.location.reload();
    })
    .catch((error) => {
      alert('please log in');
      console.log(error);
    })
}

getToken()


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
  r.preventDefault;
  inputs.value = randomGenre[Math.floor(Math.random() * randomGenre.length)];
  searchHandler();
})

modalSearchButton.onclick = function () {
  if (modalInputFiled.value == "") {
    console.log("noInput");
  }
  else {
    modal.style.display = "none";
    inputs.value = modalInputFiled.value;
    searchHandler();
  }
}
closeModle.onclick = function () {
  modal.style.display = "none";
}

// updated to remove 'getToken' call
function searchHandler() {
  if (inputs.value == '') {
    modal.style.display = "block";

  } else {

    entry = inputs.value;
    window.localStorage.setItem('searchCriteria', entry);
    if (authCode == '') {
      requestAccessToUserData();
      return 'retry';
    }
    else {
      console.log('listener active')
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
  var accessToken = JSON.parse(localStorage.getItem('oAuthToken')).access_token;
  var type = 'track'

  var url = "https://api.spotify.com/v1/search?q=" + criteria + "&type=" + type + "&limit=1";

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
      throw Error(response.statusText);
    }
  }).then(function (data) {
    var artist = data.tracks.items[0].artists[0].id
    var track = data.tracks.items[0].id
    var url2 = "https://api.spotify.com/v1/recommendations?limit=" + plLength + "&market=AU&seed_artists=" + artist + "&seed_tracks=" + track + "&min_popularity=50";
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
        throw Error(response.statusText);
      }
    }).then(function (data) {
      localStorage.setItem('recommendations', JSON.stringify(data))
      console.log('end get recommendation flow');
    }).then(function () {
      window.location.href = "https://chrisonions.github.io/webdevawesometeam/results"
    })
  }).catch((error) => {
    console.log(error)
    return 'failed';
  })
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