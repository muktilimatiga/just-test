import { createFileRoute } from '@tanstack/react-router'
import { Launcher } from './launcher'
import { Toaster } from 'sonner'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <Toaster richColors />
      <Launcher />
    </>
  )
}
