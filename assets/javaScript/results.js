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
var criteria = '';
var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var track = document.querySelector("#track");
var artist = document.querySelector("#artist");
var plLength = Number(document.querySelector('#playlistLengthNumber').value);
var recommendations = '';
var inScopeplaylistID = '';
var inScopeTrackID = '';
//var myDetails = JSON.parse(localStorage.getItem('myDetails'));
// var resultsGrid = document.querySelector('.grid-container-playlist') ---moved to within function
var playlistModal = document.querySelector(".ModalP");
var plModalContent = document.querySelector(".modal-contentP");
var plModalClose = document.querySelector("#close1");
var fetchCocktailButton = document.getElementById('fetch-cocktail-button');



// Immediately called on each load of 'RESULTS' PAGE
// THIS FUNCTION TAKES THE RESULTS AND MAKES AN EMBEDDED PLAYER FOR EACH TRACK AND MAKES A BUTTON WHICH ALLOWS ADDING IT TO PLAYLIST.

plModalClose.onclick = function () {
    playlistModal.style.display = "none";
}


function addListeners() {
    var plusButtons = document.getElementsByClassName('fa-plus');
    var playL = JSON.parse(localStorage.getItem('recommendations'));
    for (let i = 0; i < plusButtons.length; i++) {
        plusButtons[i].parentElement.setAttribute('onclick', 'showPLSelector("' + playL.tracks[i].id + '")');
    }
}

function showResults() {
    var playL = JSON.parse(localStorage.getItem('recommendations'))

    for (let i = 0; i < playL.tracks.length; i++) {
        let trackSample = playL.tracks[i].preview_url;

        let trackN = document.createElement('div');
        trackN.innerText = playL.tracks[i].name;
        trackN.setAttribute('class', 'grid-item-playlist')

        let artistN = document.createElement('div');
        artistN.innerText = playL.tracks[i].artists[0].name;
        artistN.setAttribute('class', 'grid-item-playlist')

        let iframeSample = "<iframe style='width:120px;height:58px;' frameborder='0' src='" + trackSample + "'></iframe>"
        let add2PLBtn = "<button type='button'><i class='fa fa-plus'></i>&nbsp;&nbsp;Add to playlist</button>"

        let buttonsDiv = document.createElement('div');
        if (playL.tracks[i].preview_url !== null) {
            buttonsDiv.innerHTML += iframeSample;
        } else {
            buttonsDiv.innerText += 'Preview unvailable'
        }
        buttonsDiv.innerHTML += add2PLBtn;
        buttonsDiv.setAttribute('class', 'grid-item-playlist')

        var resultsGrid = document.querySelector('.grid-container-playlist')
        resultsGrid.appendChild(trackN);
        resultsGrid.appendChild(artistN);
        resultsGrid.appendChild(buttonsDiv);

    }

    addListeners()

}

showResults()

// GET PLAYLISTS - CALL IMMEDIATELY. FUNCTION HAS TOKEN ISSUE - DASHBOARD TOKEN WORKS, OURS DOESNT - NEEDS FIX 
// GET USER PROFILE
function getUserPlaylists() {
    var accessToken = JSON.parse(localStorage.getItem('oAuthToken')).access_token;
    var url3 = "https://api.spotify.com/v1/me";
    fetch(url3, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken
        }
    }).then(function (response) {
        return response.json()
    }).then(function (data) {
        console.log(data);
        localStorage.setItem('myDetails', JSON.stringify(data));
    }).then(function () {
        var userID = JSON.parse(localStorage.getItem('myDetails')).id;
        console.log(userID);
        var url4 = "https://api.spotify.com/v1/users/" + userID + "/playlists";
        fetch(url4, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            }
        }).then(function (response) {
            console.log('passed');
            return response.json()
        }).then(function (data) {
            localStorage.setItem('playlists', JSON.stringify(data))
        }).then(function () {
            console.log('arrived at next function call')
        }).then(function () {
            console.log('arrived at pl select function call')
            createPLSelector();
        })
    })
        .catch((error) => {
            console.log('fail' + error)
        })
}
getUserPlaylists()


// ADD INDIVIDUAL TRACKS TO CHOSEN PL
// build PLAYLISTS selector - invoke after RETRIEVEUSERPLAYLISTS - function works but the div it creates needs positioning and css
// triggered by the 'getUserPlaylists' function (line 94)
function createPLSelector() {
    try {
        playlistsA = JSON.parse(window.localStorage.getItem('playlists'));
    }
    catch (error) {
        console.log('no playlist exists');
        return error;
    }
    for (let i = 0; i < playlistsA.items.length; i++) {
        let item = document.createElement('div');
        item.setAttribute('class', 'plItem');
        item.innerText = playlistsA.items[i].name;
        item.addEventListener('click', function (e) {
            e.preventDefault();
            inScopeplaylistID = playlistsA.items[i].id;
            playlistModal.style.display = "none";
            add2ExistingPL();
        })
        plModalContent.appendChild(item)
    }
}

// ADD INDIVIDUAL TRACKS TO CHOSEN PL - TOKEN ISSUE - WORKS WITH DASHBOARD TOKEN BUT NOT OUR TOKEN??!!
// Triggered by button click, see line 127 of 'createPLSelector'
function showPLSelector(a) {
    inScopeTrackID = a;
    playlistModal.style.display = 'block';
}

function add2ExistingPL() {
    var accessToken = JSON.parse(localStorage.getItem('oAuthToken')).access_token;
    var finalTrackID = "spotify%3Atrack%3A" + inScopeTrackID;
    var url5 = "https://api.spotify.com/v1/playlists/" + inScopeplaylistID + "/tracks?uris=" + finalTrackID;

    fetch(url5, {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + accessToken
        },
        method: "POST"
    })
}


//----------AUTHORISATION CODE SECTION------------=================

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

// is this needed?
function tokenHandler(authCode) {
    var authUrl = "grant_type=authorization_code";
    authUrl += "&code=" + authCode;
    authUrl += "&redirect_uri" + encodeURI(redirectUri);
    authUrl += "&client_id=" + clientID;
    authUrl += "&client_secret=" + clientSecret;
}

// retrieves and sets the oAuthToken when function is triggered. 
function getToken() {

    fetch("https://accounts.spotify.com/api/token", {
        body: "grant_type=authorization_code&code=" + authCode + "&redirect_uri=https%3A%2F%2Fchrisonions.github.io%2Fwebdevawesometeam%2F",
        headers: {
            Authorization: "Basic ODU5NDJlNWI0ZTU2NGUzMGIyMzIwNzRiZDViMTQxN2Q6N2YxMmVkOWMyMTI2NDlkZmFhNzAzODUyYTI4ZDU1MWM=",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    }).then(function (response) {
        return response.json()
    }).then(function (data) {
        console.log(data)
        localStorage.setItem('oAuthToken', JSON.stringify(data))
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

searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    searchHandler();
})

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

//============= GETS SEED DATA FROM USER INPUT AND RETRIEVES RECOMMENDATIONS ===============
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
        return response.json()
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
            return response.json()
        }).then(function (data) {
            localStorage.setItem('recommendations', JSON.stringify(data))
            console.log('end get recommendation flow');
        }).then(function () {
            window.location.href = "https://chrisonions.github.io/webdevawesometeam/results"
        })
    }).catch((error) => {
        console.log(error)
    })
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

function getRandomCocktailApi() {
    var cocktailContainer = document.getElementById("cocktail-container");
    // console.log(cocktailContainer.childNodes)
    if (cocktailContainer.childNodes.length > 5) {
        cocktailContainer.childNodes[7].remove();
        cocktailContainer.childNodes[6].remove();
        cocktailContainer.childNodes[5].remove();
    }
    var requestUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
    fetch(requestUrl)
      .then(function (response) {
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
          cocktailContainer.appendChild(cocktailName);
          cocktailContainer.appendChild(glass);
          cocktailContainer.appendChild(instructions);
        }
      });
  }

  fetchCocktailButton.addEventListener('click', getRandomCocktailApi);
