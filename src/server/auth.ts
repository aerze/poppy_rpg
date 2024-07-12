import { randomUUID } from "crypto";

interface TwitchAuthOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface SessionUserDetails {
  userid: string;
  username: string;
}

let config: TwitchAuthOptions;
const sessions = new Map();

/**
 * Create a new session and return the id for that session
 * @param {string} userid twitch userid
 * @param {string} username twitch username
 * @returns {string} session id
 */
function createSession(userid: string, username: string) {
  const id = randomUUID();
  sessions.set(id, { userid, username });
  return id;
}

/**
 * Get user details for a given session id
 * @param {string} id session id
 * @returns {{userid: string, userid: string}} session user details
 */
export function getSession(id: string): SessionUserDetails {
  return sessions.get(id);
}

/**
 * Monitors all requests for a user session
 * If no session exists, redirects to twitch
 * to authorize and creates a new session.
 * Adds user info to all requests available
 * with `req.user` in all endpoints
 */
function twitchAuthMiddleware(options: TwitchAuthOptions) {
  config = options;
  return middleware;
}

/**
 * Checks for session and adds `req.user` or
 * redirects to twitch authentication
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function middleware(req: any, res: any, next: import("express").NextFunction) {
  // Redirect all requests to /login.
  // This is effectively the same as app.get('/login', login)
  // but adding here for all-in-one configuration.
  if (req.path === "/login") return login(req, res);

  // Check for the oauth-session cookie
  const sessionid = req.cookies["oauth-session"];
  // Lookup an existing session
  const session = getSession(sessionid);
  // If there is an existing session set the user object
  // and continue the request
  if (session) {
    req.user = session;
    return next();
  }
  // Create a random state string to protect against CSRF forgery
  const state = randomUUID();
  // Setup the oauth request to twitch
  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("redirect_uri", config.redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("state", state);
  // Save state token in the client browser
  res.cookie("oauth-state", state, { maxAge: 5 * 60_000, sameSite: "lax" });
  // Redirect to twitch
  res.redirect(url.toString());
}

/**
 * After authorization with twitch
 * handle the rest of the flow
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function login(req: import("express").Request, res: import("express").Response) {
  // Check if login with twitch was rejected
  if (req.query && req.query["error"]) {
    res.redirect("/");
    return;
  }
  // Get info returned from twitch authentication
  const code = req.query["code"] as string;
  const state = req.query["state"];
  // Check that state matches the one sent with the request
  if (!state || state !== req.cookies["oauth-state"]) {
    res.redirect("/");
    return;
  }
  // Authorize with twitch directly now the user has given permission
  authorize(code).then((user) => {
    // Save the user in a new session
    const id = createSession(user.userid, user.username);
    // Send the oauth-session token to the user
    res.cookie("oauth-session", id);
    // Redirect the user back to the home page
    res.redirect("/app");
  });
}

/**
 * Authorize with twitch directly and receive the
 * @param {string} code
 * @returns {Promise<{userid: string, username: string}}
 * @throws
 */
async function authorize(code: string) {
  // Setup token request with twitch
  // This is a server -> server request using the code
  // we got from the client
  const body = transform({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });
  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("client_secret", config.clientSecret);
  url.searchParams.append("code", code);
  url.searchParams.append("grant_type", "authorization_code");
  url.searchParams.append("redirect_uri", config.redirectUri);
  const res = await fetch(url, { method: "POST", body });
  const data: any = await res.json();
  // Validate the token to get user info and return the user data
  return await validate(data.access_token);
}

/**
 * Transform the provided object into an x-www-form-urlencoded request body
 * @param {object} object
 * @returns {string}
 */
function transform(object: any) {
  return Object.entries(object)
    .map(([key, value]: [string, any]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * Validate the access token and retrieve user data
 * @param {string} token
 * @returns {Promise<{userid: string, username: string}>}
 */
async function validate(token: string) {
  // Validate the token with twitch
  const res = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${token}` },
  });
  // Anything other than 200 is a failed validation
  if (res.status !== 200) {
    throw new Error("Invalid access token");
  }
  const body: any = await res.json();
  // Extract the user data from the response and return
  return {
    userid: body["user_id"],
    username: body["login"],
  };
}

export default twitchAuthMiddleware;
