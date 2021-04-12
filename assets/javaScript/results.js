var loginButton = document.querySelector("#loginButton");
var searchButton = document.querySelector("#search");
var randomButton = document.querySelector("#random");
var searchButton = document.querySelector(".buttonDisplay");
var inputs = document.querySelector("#searchBarInput");
var playlistModal = document.querySelector(".ModalP");
var plModalContent = document.querySelector(".modal-contentP");
var plModalClose = document.querySelector("#close1");
var modalTokenError = document.querySelector(".modal");
var modalClose = document.querySelector("#close");
var modalLogin = document.querySelector('#modal-login-button');
var modalCloseTag = document.querySelector('#close');
var modalCloseButton = document.querySelector('#modal-close-button');
var noInput = document.querySelector("#no-input");
var badInput = document.querySelector('#bad-input');
var fetchCocktailButton = document.getElementById('fetch-cocktail-button');

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "85942e5b4e564e30b232074bd5b1417d"
const clientSecret = "7f12ed9c212649dfaa703852a28d551c"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
const randomGenre = ["POP", "HIPHOP", "HIP HOP", "HIP-HOP", "ROCK", "INDIE", "DANCE", "ELECTRONIC", "MOOD", "ALTERNATIVE", "COUNTRY", "JAZZ", "BLUES", "CHILL", "WORKOUT", "RNB", "R&B"]
var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var url = '';
var inScopeplaylistID = '';
var inScopeTrackID = '';


//----------AUTHENTICATION FLOW SECTION------------=================
// Users who have never logged in before or have broken authentication somehow will be directed to 'requestAccessToUserData' function. 
// Users who have a valid token issued previously will be redirected to refreshToken function if their token expires (no log in required).
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
    e.preventDefault();
    window.location.href = requestAccessToUserData();
});
modalLogin.onclick = function (e) {
    e.preventDefault();
    window.location.href = requestAccessToUserData();
}
modalCloseButton.onclick = function () {
    modalTokenError.style.display = "none";
}
modalCloseTag.onclick = function () {
    modalTokenError.style.display = "none";
}
searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    searchHandler();
})
randomButton.addEventListener("click", function (r) {
    r.preventDefault();
    inputs.value = randomGenre[Math.floor(Math.random() * randomGenre.length)];
    searchHandler();
})

// refreshes token if it expires - saves user needing to login AGAIN every visit or every 60 mins 
// The client ID and secret is hardcoded - necessary as the app is running on browser not server side.  
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
            console.log('unexpected exception');
        })
}

// ============ GENERATE SEARCH RESULTS AND GET PLAYLIST DATA =======================//
// THIS FUNCTION TAKES THE RESULTS AND MAKES AN EMBEDDED PLAYER FOR EACH TRACK AND MAKES A BUTTON WHICH ALLOWS ADDING IT TO PLAYLIST.

plModalClose.onclick = function () {
    playlistModal.style.display = "none";
}

function showResults() {
    try {
        var playL = JSON.parse(localStorage.getItem('recommendations')).tracks;
        console.log(playL);
        playL.forEach(function (song) {
            let trackSample = song.preview_url;

            //creating new div to hold title,artist, preview and playlist btn and render as cards rather than rows
            let playlistCard = document.createElement('div');
            playlistCard.setAttribute('class', 'grid-item-playlist');
            let albumCov = document.createElement('img');
            albumCov.setAttribute('src', song.album.images[1].url);
            playlistCard.appendChild(albumCov);
            let trackN = document.createElement('h3')
            trackN.innerText = song.name;
            playlistCard.appendChild(trackN);
            let artistN = document.createElement('h4');
            artistN.innerText = song.artists[0].name;
            playlistCard.appendChild(artistN);

            //changed name of buttonsDiv to preview as no longer includes add to playlist button
            let previewDiv = document.createElement('div');
            previewDiv.setAttribute("style", "justify-self: center;");
            previewDiv.setAttribute("style", "align-self: center;");

            //changed iframe to audio element
            if (song.preview_url !== null) {
                let audioEl = document.createElement('audio');
                audioEl.controls = true;
                let source = document.createElement('source');
                source.setAttribute("src", trackSample);
                audioEl.appendChild(source);
                previewDiv.appendChild(audioEl);
                playlistCard.appendChild(previewDiv);
            } else {
                previewDiv.setAttribute('id', 'noPreview');
                previewDiv.innerText = 'Preview unvailable';
                playlistCard.appendChild(previewDiv);
            }

            // creating a div to hold playlist button and appending it to the playlist card
            var addDiv = document.createElement('div');
            var addButton = document.createElement('button');
            addButton.setAttribute('type', 'button');
            var iElement = document.createElement('i');
            iElement.setAttribute('class', 'fa fa-plus');
            addButton.appendChild(iElement);
            addButton.innerHTML = "<i class='fa fa-plus'></i>&nbsp;&nbsp;Add to playlist";
            // add event listener to each button
            addButton.addEventListener('click', function () {
                showPLSelector(song.id)
            });
            addDiv.appendChild(addButton);
            playlistCard.appendChild(addDiv);
            var resultsGrid = document.querySelector('.grid-container-playlist');
            playlistCard.setAttribute('style', 'background-color: #f4f2f3;');
            resultsGrid.appendChild(playlistCard);
        })
    }
    // logs the error if try was unsucessful
    catch (error) {
        console.log('hit first error check');
        return 'login';
    }
    getUserPlaylists()
}
showResults()


// ========================== PLAYLIST HANDLING SECTION=======================//

// Called immediately upon arrival, retrieves the logged in users user ID and then fetches their playlists 
function getUserPlaylists() {
    var accessToken = JSON.parse(localStorage.getItem('token')).access_token;

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
        var userID = data.id;
        if (!userID) throw new Error("Invalid user")
        console.log(userID);
        var url4 = "https://api.spotify.com/v1/users/" + userID + "/playlists";
        fetch(url4, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            }
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            createPLSelector(data);  // Calls external function to fill out a popup with users' playlists
        })
    })
        .catch((error) => {
            console.log('fail' + error)
        })
}


// ==============CREATE PLAYLIST SELECTOR ==================//
// builds a modal which appears when user clicks one of the 'add 2 playlist' buttons
// triggered after playlists have been retrieved by the 'getUserPlaylists' function (line 101)

function createPLSelector(playlist) {
    var plist = playlist.items;
    plist.forEach(function (item) {
        let item1 = document.createElement('div');
        item1.setAttribute('class', 'plItem');
        item1.innerText = item.name;
        item1.addEventListener('click', function (e) {
            e.preventDefault();
            // inScopeplaylistID = item.id;
            playlistModal.style.display = "none";
            add2ExistingPL(item.id);
        })
        plModalContent.appendChild(item1)
    })
}

// ============= ADD TRACKS TO USER'S PLAYLIST =====================//
// After user click, first show a modal with a choice of playlists and then add the song to their chosen playlist
function showPLSelector(a) {
    inScopeTrackID = a;
    playlistModal.style.display = 'block';
}

// adds the selected song to an existing playlist 
function add2ExistingPL(pl) {
    var accessToken = JSON.parse(localStorage.getItem('token')).access_token;
    var finalTrackID = "spotify%3Atrack%3A" + inScopeTrackID;
    var url5 = "https://api.spotify.com/v1/playlists/" + pl + "/tracks?uris=" + finalTrackID;

    fetch(url5, {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + accessToken
        },
        method: "POST"
    })
}


// ==============LISTENERS for various buttons and modals =============//
loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = requestAccessToUserData();
});
modalLogin.onclick = function (e) {
    e.preventDefault();
    window.location.href = requestAccessToUserData();
}
modalCloseButton.onclick = function () {
    modalTokenError.style.display = "none";
}
modalCloseTag.onclick = function () {
    modalTokenError.style.display = "none";
}
searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    searchHandler();
})
randomButton.addEventListener("click", function (r) {
    r.preventDefault();
    inputs.value = randomGenre[Math.floor(Math.random() * randomGenre.length)];
    searchHandler();
})

// ======================= SEARCH Handling ===============================//
// when searchbox is clicked, it will check for empty search or invalid characters (since they cause a search failure)
// if a valid search is there it will show results and activate the add to playlist buttons  

// removes the 'no input' error display if user received an error and types into search field to correct it
inputs.addEventListener('keydown', function () {
    noInput.style.display = "none";
    badInput.style.display = "none";
})

// checks if the search criteria is valid
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

//============== GETS SEED DATA FROM USER INPUT AND RETRIEVE RECOMMENDATIONS ============//
//------------------- REDIRECTS TO LOGIN IF TOKEN IS MISSING OR INVALID -----------------//
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
                        console.log('ERROR2'); //suspect this will be a rare event, no handling yet
                        throw Error(response.statusText);
                    }
                }).then(function (data) {
                    localStorage.setItem('recommendations', JSON.stringify(data))
                    console.log('end get recommendation flow');
                }).then(function () {
                    window.location.href = "https://chrisonions.github.io/webdevawesometeam/results"
                })
            }).catch((error) => {  //this catch will assume that non-ok responses are due to bad token and will refresh it.
                refreshToken();
            })
    }
    catch (e) {
        console.log('missing params caught') // should get triggered if first time user without a token ignores log in and tries to search or if expired token
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

//============= 2ND API added as per requirements - excuse the recipes but they are alcohol ==============/
function getRandomCocktailApi() {
    var cocktailContainer = document.getElementById("cocktailContainer");
    cocktailContainer.textContent = "";

    var requestUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            data.drinks.forEach(function (item) {
                var cocktailName = document.createElement('h3');
                var glass = document.createElement("p");
                var instructions = document.createElement("p")
                cocktailName.textContent = item.strDrink
                glass.textContent = item.strGlass
                instructions.textContent = item.strInstructions
                cocktailContainer.appendChild(cocktailName);
                cocktailContainer.appendChild(glass);
                cocktailContainer.appendChild(instructions);
            });
        });
}
fetchCocktailButton.addEventListener('click', getRandomCocktailApi);
