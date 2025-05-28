import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_protected/other-page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/other-page"!</div>
}
