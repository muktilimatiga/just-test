import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { AppLayout } from '../components/Layout'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

import { ErrorPage } from './errors'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <AppLayout />
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
  notFoundComponent: ErrorPage,
})
