## Twitch Oauth for Poppy RPG
To add automatically managed twitch authentication use the `twitchAuthMiddleware()` in `auth.js` as middleware
```javascript
app.use(twitchAuthMiddleware(options))
```

`options` includes a `clientId`, `clientSecret`, and `redirectUri` which come from your application settings in the twitch developer dashboard. The `clientSecret` is sensitive and should not be exposed publicly. Recommended to pull these values in from environment variables to avoid checking them into version control

## Authentication Flow

User navigates to the site and the middleware checks for a session cookie. If no valid session exists the user is redirected to the twitch authorization page. After accepting the authorization and / or logging in to twitch, the user is redirected to `/login` with additional data in the url. This data is extracted and sent back to twitch from server to server which validates the connection and exchanges it for data on the user that logged in. Finally the user is redirected to the desired url for the application.

If the user has an active session, all authentication is skipped and information is pulled from the cached sessions.

If the user does not have a session cookie, and has already authorized your extension on twitch, the full flow is executed, however requires no interaction from the user. The experience of the user is "the page blinked" and then they arrive at the desired url.

## What's remaining to FULLY implement

When testing, the standalone.html page seems to bypass this authentication mechanism. This could be due to the ordering of the middleware or some other issue. That said, this may be a good thing depending on how you would like this to be implemented. 

One option is when the user accesses your site (the standalone.html page) they are instantly sent to twitch authentication and once complete, return to your page. This can be a bit jarring to be instantly ripped away, but is also closer to how it would work with the actual twitch extension; where they will have to authorize your extension before they can interact with it.

The other option is to give the user a button to click to "Login with Twitch" or something like that, and then trigger the flow from there. This is more in-line with how most sites work and a familiar experience for users, however would be a separate code path that does not exist once accessed through the actual twitch extension.

The decision on which experience you would like the player to have is a design decision, both options work from a technical perspective. 

Additionally there is still some remaining work to make this information available through the socket connection. This could be a bit tricky to get right and would like your feedback on how you would like to use the information before I can implement this fully.

For the moment until this decision has been made and we've applied the user data to the socket; I'd recommend disabling this middleware, as it shouldn't get in the way of the goals and development you are progressing. To disable just comment out the middleware registration line in `app.js`