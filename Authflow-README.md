# Web Dev Team Awesome


## AUTH FLOW chart and explanation:

Authentication flow explanation:
Access to the spotify API requires scopes to be set, and then the user must log in and accept allowing the app access to the relevant scopes. After log in, the app is granted an authorization code by spotify API, which we are then able to exchange for an OAUTH token.
The OAUTH token allows calls to the spotify API for the relevant scopes which were set in the original authorization request. 
The OAUTH token comes with an access token as well as a refresh token.
The OAUTH token expires every 60 minutes, when this happens, access will be blocked until:
1.	User logs in again and we exchange their auth code for another token or
2.	The refresh token is sent to exchange for a new access token

The basic paths the app caters for are:
MAIN PAGE
1.	First time user
-	Arrives at site
-	Token presence will be checked, it wont be present
-	Will be asked to log in
-	App will be granted an authorization code
-	Auth code will be used to obtain OAUTH token
-	User can now search
2.	Returning user
-	Arrives at site
-	Token presence is checked, it will be present
-	A refresh token will be fetched and search can continue
3.	Returning user – token or revoked or corrupted
-	Arrives at site
-	Token presence is checked, token refresh will be attempted and will fail
-	Users token will be removed 
-	User asked to log in
-	Auth code will be obtained and will be exchanged for OAUTH token
-	User can now search
RESULTS PAGE
1.	First time user 
-arrives at site - no immediate auth validation here as most users are valid. 
-User attempts a search
-Search will fail and they will be prompted to login
-then they are returned to main page where an OAUTH will be issued
-then they can search
-user can also click the log in button themselves manually.

## Pictures :
![404 image missing](./assets/Pictures/authflow.jpg)

