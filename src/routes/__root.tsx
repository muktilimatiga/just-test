import { createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Outlet } from '@tanstack/react-router'
import { TicketModal } from '../components/modal/TicketModal'

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
      <Outlet />
      <TicketModal isOpen={false} onClose={() => { }} mode="create" />
    </>
  ),
  notFoundComponent: ErrorPage,
})
