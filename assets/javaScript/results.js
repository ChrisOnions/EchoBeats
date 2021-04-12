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
var criteria = '';
var recommendations = '';
var inScopeplaylistID = '';
var inScopeTrackID = '';


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
//  --- adding next commit

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

            let iframeSample = "<iframe style='width:120px;height:58px;' frameborder='0' src='" + trackSample + "'></iframe>"
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
        return 'login';
    }
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
            console.log(data.items)
            createPLSelector(data);  // Calls external function to fill out a popup with users' playlists
        })
    })
        .catch((error) => {
            console.log('fail' + error)
        })
}
getUserPlaylists()

function createPLSelector(playlist) {
    var test = playlist.items;
    test.forEach(function (item) {
        let item1 = document.createElement('div');
        item1.setAttribute('class', 'plItem');
        item1.innerText = item.name;
        item1.addEventListener('click', function (e) {
            e.preventDefault();
            inScopeplaylistID = item.id;
            playlistModal.style.display = "none";
            add2ExistingPL();
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
function add2ExistingPL() {
    var accessToken = JSON.parse(localStorage.getItem('token')).access_token;
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
    try {
        criteria = localStorage.getItem('searchCriteria');
        console.log(criteria + " is the basis for the search");
        var accessToken = JSON.parse(localStorage.getItem('token')).access_token;

        var url = "https://api.spotify.com/v1/search?q=" + criteria + "&type=track&limit=1";
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
                console.log('ERROR0');
                throw Error(response.statusText);
            }
        })
            .catch((error) => {
                console.log('bad token')
                return
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
            }).catch((error) => {  //this error will generally get hit when user enters criteria which give an empty result.
                badInput.style.display = 'block';
                console.log('bad search criteria')
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
    if (cocktailContainer.childNodes.length > 0) {
        cocktailContainer.childNodes[2].remove();
        cocktailContainer.childNodes[1].remove();
        cocktailContainer.childNodes[0].remove();
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