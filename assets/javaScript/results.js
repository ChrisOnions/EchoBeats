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
var fetchCocktailButton = document.getElementById('fetch-cocktail-button');

const redirectUri = "https://chrisonions.github.io/webdevawesometeam/"
const clientID = "85942e5b4e564e30b232074bd5b1417d"
const clientSecret = "7f12ed9c212649dfaa703852a28d551c"
const authorise = "https://accounts.spotify.com/authorize"
const tokenHandlerUrl = "https://accounts.spotify.com/api/token"
const randomGenre = ["POP", "HIPHOP", "HIP HOP", "HIP-HOP", "ROCK", "INDIE", "DANCE", "ELECTRONIC", "MOOD", "ALTERNATIVE", "COUNTRY", "JAZZ", "BLUES", "CHILL", "WORKOUT", "RNB", "R&B"]
var oAuthToken = JSON.parse(window.localStorage.getItem('oAuthToken'));
var url = '';
var criteria = '';
var recommendations = '';
var inScopeplaylistID = '';
var inScopeTrackID = '';

// ============ GENERATE SEARCH RESULTS AND GET PLAYLIST DATA =======================//
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
// Try and get data from local storage then itterates over the tracs to display.
function showResults() {
    try {
        var playL = JSON.parse(localStorage.getItem('recommendations'));

        for (let i = 0; i < playL.tracks.length; i++) {
            let trackSample = playL.tracks[i].preview_url;

            let trackN = document.createElement('div');
            trackN.innerText = playL.tracks[i].name;
            trackN.setAttribute('class', 'grid-item-playlist')

            let artistN = document.createElement('div');
            artistN.innerText = playL.tracks[i].artists[0].name;
            artistN.setAttribute('class', 'grid-item-playlist')

            let iframeSample = "<audio control style='width:120px;height:58px;' frameborder='0' src='" + trackSample + "'></audio>"
            let add2PLBtn = "<button type='button'><i class='fa fa-plus'></i>&nbsp;&nbsp;Add to playlist</button>"


            let buttonsDiv = document.createElement('div');
            // If the tracks have a preview "not all do" also adds to list

            //changed name of buttonsDiv to preview as no longer includes add to playlist button
            let previewDiv = document.createElement('div');

            if (playL.tracks[i].preview_url !== null) {
                previewDiv.innerHTML += iframeSample;
            } else {
                previewDiv.innerText += 'Preview unvailable';
            }
            // separating add to playlist and preview in column
            let add2PLBtnDiv = document.createElement('div');
            add2PLBtnDiv.innerHTML += add2PLBtn;
            add2PLBtnDiv.setAttribute('class', 'grid-item-playlist')
            add2PLBtnDiv.setAttribute('style', 'justify-self: end;')

            var resultsGrid = document.querySelector('.grid-container-playlist')
            resultsGrid.appendChild(trackN);
            resultsGrid.appendChild(artistN);
            resultsGrid.appendChild(previewDiv);
            resultsGrid.appendChild(add2PLBtnDiv);
        }
        // Calls function to add listeners over the added buttons
        addListeners()
    }
    // Catches the error if try was unsucessful
    catch (error) {
        console.log('hit first error check');
        modalTokenError.style.display = 'block';
        return 'login';
    }
}
showResults()


// ========================== PLAYLIST HANDLING SECTION=======================//

// Called immediately upon arrival, retrieves the logged in users user ID and then fetches their playlists 
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
            createPLSelector();  // Calls external function to fill out a popup with users' playlists
        })
    })
        .catch((error) => {
            console.log('fail' + error)
        })
}
getUserPlaylists()


// ==============CREATE PLAYLIST SELECTOR ==================//
// builds a modal which appears when user clicks one of the 'add 2 playlist' buttons
// triggered after playlists have been retrieved by the 'getUserPlaylists' function (line 101)
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

// ============= ADD TRACKS TO USER'S PLAYLIST =====================//
// After user click, first show a modal with a choice of playlists and then add the song to their chosen playlist
function showPLSelector(a) {
    inScopeTrackID = a;
    playlistModal.style.display = 'block';
}

// adds the selected song to an existing playlist 
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



//----------AUTHENTICATION FLOW SECTION------------=================
// There are various times a user could be redirected to log in - if token expired, or removed. 
// below is needed incase of authorisation break and redirect to log in is required. 
function requestAccessToUserData() {
    url = authorise;
    url += "?client_id=" + clientID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirectUri);
    url += "&show_dialog=True";
    url += "&scope=playlist-modify-public user-modify-playback-state playlist-modify-private user-library-read playlist-read-collaborative "
    return url;
};

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
// when searchbox is clicked, it will save the entered text to local storage (so that it is persistent across screens)
// it will ask user to log in if they are not logged in
// if a valid search is there it will show results and activate the add to playlist buttons  

// removes the 'no input' error display when user types into search field
inputs.addEventListener('keydown', function () {
    noInput.style.display = "none";
})

// Decides what to do when a user clicks search - if search empty you get error (unless you choose random)
function searchHandler() {
    if (inputs.value == '') {
        noInput.style.display = "block";
    } else {
        entry = inputs.value;
        window.localStorage.setItem('searchCriteria', entry);
        console.log('search received');
        getSeeds();
    }
}

//============== GETS SEED DATA FROM USER INPUT AND RETRIEVE RECOMMENDATIONS ============//
//------------------- REDIRECTS TO LOGIN IF TOKEN IS MISSING OR INVALID -----------------//
function getSeeds() {
    console.log("arrived at seed search");
    try {
        var accessToken = JSON.parse(localStorage.getItem('oAuthToken')).access_token;
    }
    catch (error) {
        console.log('error - oAuthcode is invalid');
        modalTokenError.style.display = "block";
        return error;
    }

    criteria = localStorage.getItem('searchCriteria');
    console.log(criteria + " is the basis for the search");
    var accessToken = JSON.parse(localStorage.getItem('oAuthToken')).access_token;
    var type = 'track'
    var playlistLength = Number(document.querySelector('#playlistLengthNumber').value);

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
        var url2 = "https://api.spotify.com/v1/recommendations?limit=" + playlistLength + "&market=AU&seed_artists=" + artist + "&seed_tracks=" + track + "&min_popularity=50";
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
        console.log(error);
        modalTokenError.style.display = "block";
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

//============= 2ND API added as per requirements - excuse the recipes but they are alcohol ==============/
function getRandomCocktailApi() {
    var cocktailContainer = document.getElementById("cocktailContainer");
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