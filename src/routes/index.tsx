import { createFileRoute } from '@tanstack/react-router'
import { Launcher } from './launcher'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <Launcher />
  )
}
