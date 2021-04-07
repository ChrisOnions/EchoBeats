var loginButton = document.getElementById("loginButton")

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "85942e5b4e564e30b232074bd5b1417d"
const clientSecret = "7f12ed9c212649dfaa703852a28d551c"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
var url = ""
var authCode = ""
var searchButton = document.querySelector(".buttonDisplay");
var inputs = document.querySelector("#searchBarInput");
var criteria = JSON.parse(window.localStorage.getItem('searchCriteria'));


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
  entry = JSON.stringify(inputs.value);
  window.localStorage.setItem('searchCriteria', entry);
  if (authCode == '') {
    requestAccessToUserData();
    return 'retry';
  }
  else {
    console.log('listener active')
    window.location.replace("https://chrisonions.github.io/webdevawesometeam/results.html?code=" + authCode);
    searchTracks();
  }
}

function searchTracks() {
  console.log("arrived at track search");
  console.log(criteria);
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