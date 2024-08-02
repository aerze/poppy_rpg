function reduceCookieToObject(map: Record<string, string>, cookie: string) {
  const [key, value] = cookie.trim().split("=");
  map[key] = value;
  return map;
}

export function parseCookies(cookieString: string = "") {
  return cookieString.split(";").reduce(reduceCookieToObject, {});
}
