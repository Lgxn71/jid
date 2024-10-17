import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "_session", // use any name you want here
		sameSite: "lax", // this helps with CSRF
		path: "/", // remember to add this so the cookie will work in all routes
		httpOnly: true, // for security reasons, make this cookie http only
		secrets: ['asdjo1i23ums9!3nsadslk'], // replace this with an actual secret
		secure: process.env.NODE_ENV === "production", // enable this in prod only
	},
});

// you can also export the methods individually for your own usage
export const themeSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__remix-themes",
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secrets: ["ThemeSecret123"],
	},
});

export const themeSessionResolver =
	createThemeSessionResolver(themeSessionStorage);

export const { getSession, commitSession, destroySession } = sessionStorage;
