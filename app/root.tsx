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

import { authenticator } from './routes/auth+/server';
import { parse, stringify } from 'superjson';
import type { User } from '@prisma/client';
import { UserContext } from './context/userContext';
import { useState } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { useDehydratedState } from 'use-dehydrated-state';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000
          }
        }
      })
  );

  broadcastQueryClient({
    queryClient
  });

  const dehydratedState = useDehydratedState();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider
          specifiedTheme={data.theme}
          themeAction="/action/set-theme"
        >
          <Layout />
        </ThemeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
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
        <ReactQueryDevtools />

        <UserContext.Provider value={user}>
          <Outlet />
        </UserContext.Provider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
