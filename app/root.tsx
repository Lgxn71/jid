import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import clsx from 'clsx';
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme
} from 'remix-themes';
import { themeSessionResolver } from './sessions.server';
import '~/tailwind.css';
import { Toaster } from './components/ui/toaster';

import { authenticator } from './auth.server';
import { parse, stringify } from 'superjson';
import type { User } from '@prisma/client';
import { UserContext } from './context/userContext';

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const user = await authenticator.isAuthenticated(request);
  return {
    theme: getTheme(),
    user: stringify(user)
  };
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <Layout />
    </ThemeProvider>
  );
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  }
];

function Layout() {
  const data = useLoaderData<typeof loader>();
  const user = parse<User | null>(data.user);
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <div id="modal-background" />
        <Toaster />

        <UserContext.Provider value={user}>
          <Outlet />
        </UserContext.Provider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
